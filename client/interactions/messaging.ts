import sendPacket from '../helpers/sendPacket';
import log from '../helpers/logger';

const mongoose = require('mongoose');

import { Conversation, Message, User } from '../models';

export function createThread(req, io, callback) {
  const { message, tempID, recipients } = req.body;
  const { _id: userID } = req.user;

  checkConversationExists(userID, recipients, (packet) => {
    if (packet['success'] === -1) return callback(packet);
    if (packet['success'] === 1)
      return sendMessage(
        userID,
        packet['content']['conversationID'],
        message,
        tempID,
        io,
        callback
      );

    checkUsersConnected(userID, recipients, (packet) => {
      if (packet['success'] !== 1) return callback(packet);

      let newConversation = new Conversation();
      newConversation.participants = recipients.concat(userID);

      newConversation.save((err, conversation) => {
        if (err) {
          log('error', err);
          return callback(
            sendPacket(-1, 'There was an error saving the conversation')
          );
        }

        const { _id: conversationID } = conversation;
        sendMessage(userID, conversationID, message, tempID, io, callback);
      });
    });
  });
}

export function removeConversation(conversationID, callback) {
  Conversation.deleteOne({ _id: conversationID }, (err) => {
    if (err) return callback(-1, 'Failed to delete conversation');
    return callback(1, 'Deleted conversation');
  });
}

export function sendMessage(userID, conversationID, message, tempID, io, callback) {
  Conversation.findById(conversationID, (err, currConversation) => {
    if (err || conversationID === undefined || currConversation === null) {
      log('error', err);
      return callback(sendPacket(-1, 'Could not find conversation', { tempID }));
    }

    if (!userIsParticipant(userID, currConversation.participants))
      return callback(sendPacket(0, 'User is not in this Conversation'));

    User.findById(userID, ['firstName', 'lastName'], (err, user) => {
      if (err) return callback(sendPacket(-1, err));
      if (!user) return callback(0, "Couldn't find user");

      let newMessage = new Message();
      newMessage.conversationID = conversationID;
      newMessage.sender = userID;
      newMessage.senderName = `${user.firstName} ${user.lastName}`;
      newMessage.content = message;
      newMessage.save((err) => {
        if (err) {
          log('error', err);
          return callback(
            sendPacket(-1, 'There was an error saving the message', { tempID })
          );
        }

        let isNewConversation = false;
        if (currConversation.lastMessage === undefined) isNewConversation = true;

        currConversation.lastMessage = newMessage._id;
        currConversation.save(async (err) => {
          if (err) {
            log('error', err);
            return callback(
              sendPacket(-1, 'There was an error updating the conversation')
            );
          }

          await currConversation
            .populate('lastMessage')
            .populate('participants')
            .execPopulate();

          if (isNewConversation) {
            currConversation.participants.forEach((recipient) => {
              io.in(`USER_${recipient._id}`).emit(
                'newConversation',
                currConversation
              );
            });
          }

          let jsonNewMessage = newMessage.toObject();
          jsonNewMessage.tempID = tempID;

          io.in(`CONVERSATION_${newMessage.conversationID}`).emit(
            'newMessage',
            jsonNewMessage
          );
          return callback(sendPacket(1, 'Message sent', { currConversation }));
        });
      });
    });
  });
}

export async function getLatestThreads(userID, callback) {
  function timeStampCompare(ObjectA, ObjectB) {
    const a = !ObjectA.lastMessage
      ? ObjectA.createdAt
      : ObjectA.lastMessage.createdAt;

    const b = !ObjectB.lastMessage
      ? ObjectB.createdAt
      : ObjectB.lastMessage.createdAt;

    if (a < b) return 1;
    if (b < a) return -1;
    return 0;
  }

  let userConversations = await Conversation.find({
    participants: userID,
  })
    .populate('lastMessage')
    .populate('participants', '_id firstName lastName');

  if (userConversations === undefined || userConversations === null)
    return callback(
      sendPacket(-1, 'There was an error retrieving the Conversations')
    );

  userConversations.sort(timeStampCompare);
  callback(sendPacket(1, "Sending User's Conversations", { userConversations }));
}

export function getLatestMessages(
  userID,
  conversationID,
  maxMessages = 200,
  callback
) {
  Conversation.findById(conversationID, async (err, conversation) => {
    if (err) {
      log('error', err);
      return callback(sendPacket(-1, err));
    }
    if (!conversation) return callback(sendPacket(0, 'Could not find Conversation'));

    Message.aggregate([
      { $match: { conversationID: mongoose.Types.ObjectId(conversationID) } },
      { $sort: { createdAt: -1 } },
      { $limit: maxMessages },
      { $sort: { createdAt: 1 } },
      {
        $project: {
          numLikes: { $size: '$likes' },
          liked: { $in: [mongoose.Types.ObjectId(userID), '$likes'] },
          conversationID: '$conversationID',
          senderName: '$senderName',
          sender: '$sender',
          content: '$content',
          createdAt: '$createdAt',
        },
      },
    ])
      .exec()
      .then((messages) => {
        if (!messages) return callback(sendPacket(-1, 'Could not find Messages'));
        callback(
          sendPacket(1, 'Sending Conversation and Messages', {
            conversation,
            messages,
          })
        );
      })
      .catch((err) => callback(sendPacket(-1, err)));
  });
}

export function updateLike(userID, messageID, liked, io, callback) {
  User.findById(userID, ['firstName', 'lastName'], (err, user) => {
    if (err) return callback(sendPacket(-1, err));
    if (!user) return callback(sendPacket(0, 'Could not find User'));

    Message.findById(messageID, ['likes', 'conversationID'], (err, message) => {
      if (err) return callback(sendPacket(-1, err));
      if (!message)
        return callback(sendPacket(-1, 'Could not find message to like'));

      const alreadyLiked = message.likes.includes(userID);

      if (liked && !alreadyLiked) message.likes.push(userID);
      else if (!liked && alreadyLiked)
        message.likes.splice(message.likes.indexOf(userID), 1);

      message.save((err, message) => {
        if (err) return callback(sendPacket(-1, err));
        if (!message)
          return callback(sendPacket(-1, 'There was an error saving the like'));

        io.in(`CONVERSATION_${message.conversationID}`).emit('updateLikes', {
          messageID: message._id,
          numLikes: message.likes.length,
          liked,
          liker: userID,
          likerName: `${user.firstName} ${user.lastName}`,
        });
        callback(sendPacket(1, 'Updated like state', { newLiked: liked }));
      });
    });
  });
}

export function getLiked(userID, messageID, callback) {
  Message.findById(messageID, ['content', 'likes'], (err, message) => {
    if (err) return callback(sendPacket(-1, err));
    if (!message) return callback(sendPacket(-1, 'Could not find message'));

    const liked = message.likes.includes(userID);
    callback(sendPacket(1, 'Sending liked value', { liked: liked }));
  });
}

export function connectSocketToConversations(socket, conversations) {
  conversations.forEach((conversation) => {
    socket.join(`CONVERSATION_${conversation._id}`);
  });
}

function checkUsersConnected(userID, otherUserIDs, callback) {
  otherUserIDs = stringsToUserIDs(otherUserIDs);
  const lookupConnections = {
    $lookup: {
      from: 'connections',
      localField: 'connections',
      foreignField: '_id',
      as: 'connections',
    },
  };
  const transformToArray = {
    $project: { connections: ['$connections.from', '$connections.to'] },
  };
  const squashToSingleArray = {
    $project: {
      connections: {
        $reduce: {
          input: '$connections',
          initialValue: [],
          in: { $concatArrays: ['$$value', '$$this'] },
        },
      },
    },
  };
  User.aggregate([
    { $match: { _id: mongoose.Types.ObjectId(userID) } },
    lookupConnections,
    transformToArray,
    squashToSingleArray,
    {
      $project: {
        unConnected: {
          $filter: {
            input: otherUserIDs,
            as: 'otherUser',
            cond: {
              $not: {
                $in: ['$$otherUser', '$connections'],
              },
            },
          },
        },
        connections: '$connections',
      },
    },
  ])
    .exec()
    .then((user) => {
      if (!user || user.length === 0)
        return callback(sendPacket(-1, "Couldn't find user to check connections"));
      const unConnected = user[0].unConnected;
      if (unConnected.length > 0)
        return callback(sendPacket(0, 'Users not connected', { unConnected }));
      else return callback(sendPacket(1, 'Connected to all users'));
    })
    .catch((err) => callback(sendPacket(-1, err)));
}

function checkConversationExists(userID, recipients, callback) {
  const participants = recipients.concat(userID);
  Conversation.findOne(
    { participants: { $all: participants } },
    (err, conversation) => {
      if (err) return callback(sendPacket(-1, err));
      if (!conversation) return callback(sendPacket(0, 'No matching Conversations'));
      return callback(
        sendPacket(1, 'Sending existing Conversation', {
          conversationID: conversation._id,
        })
      );
    }
  );
}

function stringsToUserIDs(array) {
  let ret = [];
  array.forEach((element) => {
    ret.push(mongoose.Types.ObjectId(element));
  });

  return ret;
}

function userIsParticipant(userID, participants) {
  // Prevents infiltration to private convos, but allows sending event messages
  return participants.includes(userID) || participants.length === 0;
}
