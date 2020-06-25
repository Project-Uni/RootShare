import sendPacket from "../helpers/sendPacket";
import log from "../helpers/logger";

const mongoose = require("mongoose");
const User = mongoose.model("users");
const Conversation = mongoose.model("conversations");
const Message = mongoose.model("messages");

module.exports = {
  createThread: (req, callback) => {
    const { message, recipients } = req.body;
    const { _id: userID } = req.user;

    if (recipients === undefined)
      return callback(sendPacket(-1, "Could not find conversation"));

    let newConversation = new Conversation();
    newConversation.participants = recipients;
    newConversation.participants.push(userID);
    newConversation.save((err, conversation) => {
      if (err) {
        log("error", err);
        return callback(
          sendPacket(-1, "There was an error saving the conversation")
        );
      }

      const { _id: conversationID } = conversation;
      module.exports.sendMessage(userID, conversationID, message, callback);
    });
  },

  sendMessage: (userID, conversationID, message, callback) => {
    Conversation.findById(conversationID, (err, currConversation) => {
      if (err || conversationID === undefined) {
        log("error", err);
        return callback(sendPacket(-1, "Could not find conversation"));
      }

      let newMessage = new Message();
      newMessage.conversationID = conversationID;
      newMessage.sender = userID;
      newMessage.content = message;
      newMessage.timeCreated = new Date();
      newMessage.save((err) => {
        if (err) {
          log("error", err);
          return callback(
            sendPacket(-1, "There was an error saving the message")
          );
        }

        currConversation.lastMessage = newMessage._id;
        currConversation.save((err) => {
          if (err) {
            log("error", err);
            return callback(
              sendPacket(1, "There was an error updating the conversation")
            );
          }

          return callback(sendPacket(1, "Message sent"));
        });
      });
    });
  },

  getLatestThreads: async (userID, callback) => {
    function timeStampCompare(ObjectA, ObjectB) {
      const a = ObjectA.lastMessage.timeCreated;
      const b = ObjectB.lastMessage.timeCreated;

      if (a < b) return 1;
      if (b < a) return -1;
      return 0;
    }

    let userConversations = await Conversation.find({
      participants: userID,
    }).populate("lastMessage");

    if (userConversations === undefined)
      return callback(
        sendPacket(-1, "There was an error retrieving the Conversations")
      );

    userConversations.sort(timeStampCompare);
    callback(
      sendPacket(1, "Sending User's Conversations", { userConversations })
    );
  },

  getLatestMessages: async (userID, conversationID, callback) => {
    Conversation.findById(conversationID, (err, conversation) => {
      if (err) {
        log("error", err);
        return callback(sendPacket(-1, "Could not find Conversation"));
      }

      Message.find(
        { conversationID },
        ["sender", "content", "timeCreated"],
        (err, messages) => {
          if (err) {
            log("error", err);
            return callback(sendPacket(-1, "Could not find Messages"));
          }

          return callback(
            sendPacket(1, "Sending Conversation and Messages", {
              conversation,
              messages,
            })
          );
        }
      );
    });
  },
};
