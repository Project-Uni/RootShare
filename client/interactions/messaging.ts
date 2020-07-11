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

    if (recipients === undefined)
      return callback(sendPacket(-1, 'Could not find conversation'));

    let newConversation = new Conversation();
    newConversation.participants = recipients;
    newConversation.participants.push(userID);
    newConversation.timeCreated = new Date();
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
      newMessage.timeCreated = new Date();
      newMessage.save((err) => {
        if (err) {
          log('error', err);
          return callback(sendPacket(-1, 'There was an error saving the message'));
        }

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

          io.in(newMessage.conversationID).emit('newMessage', newMessage);
          return callback(sendPacket(1, 'Message sent', { currConversation }));
        });
      });
    });
  },

  getLatestThreads: async (userID, callback) => {
    function timeStampCompare(ObjectA, ObjectB) {
      const a =
        ObjectA.lastMessage !== undefined
          ? ObjectA.lastMessage.timeCreated
          : ObjectA.timeCreated;
      const b =
        ObjectB.lastMessage !== undefined
          ? ObjectB.lastMessage.timeCreated
          : ObjectB.timeCreated;

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
    Conversation.findById(conversationID, (err, conversation) => {
      if (err || conversation === undefined || conversation === null) {
        log('error', err);
        return callback(sendPacket(-1, 'Could not find Conversation'));
      }

      Message.find(
        { conversationID },
        ['sender', 'senderName', 'content', 'timeCreated'],
        (err, messages) => {
          if (err || messages === undefined || messages === null) {
            log('error', err);
            return callback(sendPacket(-1, 'Could not find Messages'));
          }

          return callback(
            sendPacket(1, 'Sending Conversation and Messages', {
              conversation,
              messages,
            })
          );
        }
      ).sort({ timeCreated: 'ascending' });
    });
  },
  connectSocketToConversations: (socket, conversations) => {
    conversations.forEach((conversation) => {
      socket.join(conversation._id);
    });
  },
};
