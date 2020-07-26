import sendPacket from '../helpers/sendPacket';
import log from '../helpers/logger';

const mongoose = require('mongoose');
const User = mongoose.model('users');
const Conversation = mongoose.model('conversations');
const Message = mongoose.model('messages');

module.exports = {
  createThread: (req, io, callback) => {
    const { message, recipients } = req.body;
    const { _id: userID, firstName } = req.user;

    let newConversation = new Conversation();
    newConversation.participants = module.exports.fixRecipients(recipients, userID);

    newConversation.save((err, conversation) => {
      if (err) {
        log('error', err);
        return callback(
          sendPacket(-1, 'There was an error saving the conversation')
        );
      }

      const { _id: conversationID } = conversation;
      module.exports.sendMessage(
        userID,
        firstName,
        conversationID,
        message,
        io,
        callback
      );
    });
  },

  fixRecipients: (recipients, userID) => {
    if (recipients === undefined) return [];

    let hasSelf = false;
    for (let i = 0; i < recipients.length; i++) {
      if (recipients[i].localeCompare(userID) === 0) {
        hasSelf = true;
        break;
      }
    }

    if (!hasSelf) return recipients.concat(userID);
    return recipients;
  },

  removeConversation: (conversationID, callback) => {
    Conversation.deleteOne({ _id: conversationID }, (err) => {
      if (err) return callback(-1, 'Failed to delete conversation');
      return callback(1, 'Deleted conversation');
    });
  },

  sendMessage: (userID, userName, conversationID, message, io, callback) => {
    Conversation.findById(conversationID, (err, currConversation) => {
      if (err || conversationID === undefined || currConversation === null) {
        log('error', err);
        return callback(sendPacket(-1, 'Could not find conversation'));
      }

      let newMessage = new Message();
      newMessage.conversationID = conversationID;
      newMessage.sender = userID;
      newMessage.senderName = userName;
      newMessage.content = message;
      newMessage.save((err) => {
        if (err) {
          log('error', err);
          return callback(sendPacket(-1, 'There was an error saving the message'));
        }

        let isNewConversation = false;
        if (currConversation.lastMessage === undefined) isNewConversation = true;

        currConversation.lastMessage = newMessage._id;
        currConversation.save(async (err) => {
          if (err) {
            log('error', err);
            return callback(
              sendPacket(1, 'There was an error updating the conversation')
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
          io.in(`CONVERSATION_${newMessage.conversationID}`).emit(
            'newMessage',
            newMessage
          );
          return callback(sendPacket(1, 'Message sent', { currConversation }));
        });
      });
    });
  },

  getLatestThreads: async (userID, callback) => {
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
      .populate('participants');

    if (userConversations === undefined || userConversations === null)
      return callback(
        sendPacket(-1, 'There was an error retrieving the Conversations')
      );

    userConversations.sort(timeStampCompare);
    callback(sendPacket(1, "Sending User's Conversations", { userConversations }));
  },

  getLatestMessages: async (userID, conversationID, callback) => {
    Conversation.findById(conversationID, async (err, conversation) => {
      if (err || conversation === undefined || conversation === null) {
        log('error', err);
        return callback(sendPacket(-1, 'Could not find Conversation'));
      }

      Message.aggregate([
        { $match: { conversationID: mongoose.Types.ObjectId(conversationID) } },
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
  },

  updateLike: (userID, messageID, liked, io, callback) => {
    Message.findById(messageID, ['likes', 'conversationID'], (err, message) => {
      if (err) return callback(sendPacket(-1, err));
      if (!message)
        return callback(sendPacket(-1, 'Could not find message to like'));

      const alreadyLiked = message.likes.includes(userID);
      let likeCount = message.likes.length;

      if (liked && !alreadyLiked) {
        message.likes.push(userID);
        likeCount++;
      } else if (!liked && alreadyLiked) {
        message.likes.splice(message.likes.indexOf(userID), 1);
        likeCount--;
      }

      message.save((err) => {
        if (err) return callback(sendPacket(-1, err));

        io.in(`CONVERSATION_${message.conversationID}`).emit('updateLikes', {
          messageID: message._id,
          numLikes: likeCount,
        });
        callback(sendPacket(1, 'Updated like state', { newLiked: liked }));
      });
    });
  },

  getLiked: (userID, messageID, callback) => {
    Message.findById(messageID, ['content', 'likes'], (err, message) => {
      if (err) return callback(sendPacket(-1, err));
      if (!message) return callback(sendPacket(-1, 'Could not find message'));

      const liked = message.likes.includes(userID);
      callback(sendPacket(1, 'Sending liked value', { liked: liked }));
    });
  },

  connectSocketToConversations: (socket, conversations) => {
    conversations.forEach((conversation) => {
      socket.join(`CONVERSATION_${conversation._id}`);
    });
  },
};
