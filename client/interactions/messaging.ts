import { Conversation, Message, User } from '../rootshare_db/models';
import { packetParams, ObjectIdVal, ObjectIdType } from '../rootshare_db/types';
import {
  log,
  sendPacket,
  retrieveSignedUrl,
  getUserFromJWT,
} from '../helpers/functions';

export function createThread(req, io, callback: (packet: packetParams) => void) {
  const { message, tempID, recipients } = req.body;
  const { _id: userID } = getUserFromJWT(req);

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

    const recipientIDs = recipients.map((r) => ObjectIdVal(r));
    checkUsersConnected(userID, recipientIDs, (packet) => {
      if (packet['success'] !== 1) return callback(packet);

      let newConversation = new Conversation.model();
      newConversation.participants = recipients.concat(userID);

      newConversation.save((err, conversation) => {
        if (err) {
          log('error', err.message);
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

export function sendMessage(
  userID: ObjectIdType,
  conversationID: ObjectIdType,
  message: string,
  tempID: string,
  io,
  callback: (packet: packetParams) => void
) {
  Conversation.model.findById(conversationID, (err, currConversation) => {
    if (err || conversationID === undefined || currConversation === null) {
      log('error', err);
      return callback(sendPacket(-1, 'Could not find conversation', { tempID }));
    }

    if (!userIsParticipant(userID, currConversation.participants as ObjectIdType[]))
      return callback(sendPacket(0, 'User is not in this Conversation'));

    User.model.findById(userID, ['firstName', 'lastName'], {}, (err, user) => {
      if (err) return callback(sendPacket(-1, err.message));
      if (!user) return callback(sendPacket(0, "Couldn't find user"));

      let newMessage = new Message.model();
      newMessage.conversationID = conversationID;
      newMessage.sender = userID;
      newMessage.senderName = `${user.firstName} ${user.lastName}`;
      newMessage.content = message;
      newMessage.save((err) => {
        if (err) {
          log('error', err.message);
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

          if (isNewConversation)
            emitPicturedConversation(userID, currConversation.toObject(), io);

          let jsonNewMessage: any = newMessage.toObject();
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

export async function getLatestThreads(
  userID: ObjectIdType,
  callback: (packet: packetParams) => void
) {
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

  let userConversations = await Conversation.model
    .find({
      participants: userID,
    })
    .populate('lastMessage')
    .populate('participants', '_id firstName lastName profilePicture')
    .lean();

  if (!userConversations)
    return callback(
      sendPacket(-1, 'There was an error retrieving the Conversations')
    );

  userConversations.sort(timeStampCompare);
  await addProfilePictureToConversations(userID, userConversations);
  callback(
    sendPacket(1, "Sending User's Conversations", {
      userConversations,
    })
  );
}

async function emitPicturedConversation(
  userID: ObjectIdType,
  conversation: any,
  io
) {
  if (conversation.participants.length !== 2)
    return conversation.participants.forEach((recipient) => {
      conversation;
      io.in(`USER_${recipient._id}`).emit('newConversation', conversation);
    });

  let imagePromises = [];
  for (let i = 0; i < 2; i++) {
    const otherPerson = conversation.participants[(i + 1) % 2];
    if (otherPerson.profilePicture) {
      try {
        const signedImageUrlPromise = retrieveSignedUrl(
          'images',
          'profile',
          otherPerson.profilePicture
        );
        imagePromises.push(signedImageUrlPromise);
      } catch (err) {
        log('error', err);
        imagePromises.push(null);
      }
    } else {
      imagePromises.push(null);
    }
  }

  Promise.all(imagePromises)
    .then((signedImageURLs) => {
      for (let i = 0; i < 2; i++) {
        const currConversation = Object.assign({}, conversation);
        if (signedImageURLs[i])
          currConversation.conversationPicture = signedImageURLs[i];

        io.in(`USER_${conversation.participants[i]._id}`).emit(
          'newConversation',
          currConversation
        );
      }
    })
    .catch((err) => {
      log('error', err);
    });
}

function addProfilePictureToConversations(
  userID: ObjectIdType,
  conversations: any[]
) {
  const imagePromises = [];
  conversations.forEach((conversation) => {
    if (conversation.participants.length === 2) {
      const otherPerson =
        conversation.participants[0]._id.toString() === userID.toString()
          ? conversation.participants[1]
          : conversation.participants[0];
      if (otherPerson.profilePicture) {
        try {
          const signedImageUrlPromise = retrieveSignedUrl(
            'images',
            'profile',
            otherPerson.profilePicture
          );
          imagePromises.push(signedImageUrlPromise);
        } catch (err) {
          log('error', err);
          imagePromises.push(null);
        }
      } else {
        imagePromises.push(null);
      }
    } else {
      imagePromises.push(null);
    }
  });

  return Promise.all(imagePromises)
    .then((signedImageURLs) => {
      for (let i = 0; i < conversations.length; i++)
        if (signedImageURLs[i])
          conversations[i].conversationPicture = signedImageURLs[i];
    })
    .catch((err) => {
      log('error', err);
    });
}

export function getLatestMessages(
  userID: ObjectIdType,
  conversationID: ObjectIdType,
  maxMessages = 200,
  callback: (packet: packetParams) => void
) {
  Conversation.model.findById(conversationID, async (err, conversation) => {
    if (err) {
      log('error', err);
      return callback(sendPacket(-1, err));
    }
    if (!conversation) return callback(sendPacket(0, 'Could not find Conversation'));

    Message.model
      .aggregate([
        { $match: { conversationID: ObjectIdVal(conversationID.toString()) } },
        { $sort: { createdAt: -1 } },
        { $limit: maxMessages },
        { $sort: { createdAt: 1 } },
        {
          $project: {
            numLikes: { $size: '$likes' },
            liked: { $in: [ObjectIdVal(userID.toString()), '$likes'] },
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

export function updateLike(
  userID: ObjectIdType,
  messageID: ObjectIdType,
  liked: boolean,
  io,
  callback: (packet: packetParams) => void
) {
  User.model.findById(userID, ['firstName', 'lastName'], {}, (err, user) => {
    if (err) return callback(sendPacket(-1, err.message));
    if (!user) return callback(sendPacket(0, 'Could not find User'));

    Message.model.findById(
      messageID,
      ['likes', 'conversationID'],
      {},
      (err, message) => {
        if (err) return callback(sendPacket(-1, err.message));
        if (!message)
          return callback(sendPacket(-1, 'Could not find message to like'));

        message.likes = message.likes as ObjectIdType[];
        const alreadyLiked = message.likes.includes(userID);

        if (liked && !alreadyLiked) message.likes.push(userID);
        else if (!liked && alreadyLiked)
          message.likes.splice(message.likes.indexOf(userID), 1);

        message.save((err, message) => {
          if (err) return callback(sendPacket(-1, err.message));
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
      }
    );
  });
}

export function getLiked(
  userID: ObjectIdType,
  messageID: ObjectIdType,
  callback: (packet: packetParams) => void
) {
  Message.model.findById(messageID, ['content', 'likes'], {}, (err, message) => {
    if (err) return callback(sendPacket(-1, err.message));
    if (!message) return callback(sendPacket(-1, 'Could not find message'));

    const liked = (message.likes as ObjectIdType[]).includes(userID);
    callback(sendPacket(1, 'Sending liked value', { liked: liked }));
  });
}

export function connectSocketToConversations(socket, conversations: any[]) {
  conversations.forEach((conversation) => {
    socket.join(`CONVERSATION_${conversation._id}`);
  });
}

function checkUsersConnected(
  userID: ObjectIdType,
  otherUserIDs: ObjectIdType[],
  callback: (packet: packetParams) => void
) {
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
  User.model
    .aggregate([
      { $match: { _id: ObjectIdVal(userID.toString()) } },
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

function checkConversationExists(
  userID: ObjectIdType,
  recipients: ObjectIdType[],
  callback: (packet: packetParams) => void
) {
  const participants = recipients.concat(userID);
  Conversation.model.findOne(
    { participants: { $all: participants, $size: participants.length } },
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

function userIsParticipant(userID: ObjectIdType, participants: ObjectIdType[]) {
  // Prevents infiltration to private convos, but allows sending event messages
  return participants.includes(userID) || participants.length === 0;
}
