import sendPacket from '../helpers/sendPacket';
var mongoose = require('mongoose');
var User = mongoose.model('users');
import log from '../helpers/logger';

import { isAuthenticatedWithJWT } from '../passport/middleware/isAuthenticated';
const {
  createThread,
  sendMessage,
  getLatestThreads,
  getLatestMessages,
  connectSocketToConversations,
} = require('../interactions/messaging');

module.exports = (app, io) => {
  io.on('connection', (socket) => {
    log('info', 'New client connected');

    socket.on('metadata', (conversations, userID) => {
      connectSocketToConversations(socket, conversations);
      socket.join(`USER_${userID}`);
    });

    socket.on('connectToConversation', (conversationID) => {
      socket.join(`CONVERSATION_${conversationID}`);
    });

    socket.on('disconnect', () => {
      log('info', 'Client disconnected');
    });
  });

  app.post('/api/messaging/sendMessage', isAuthenticatedWithJWT, (req, res) => {
    sendMessage(
      req.user._id,
      req.user.firstName,
      req.body.conversationID,
      req.body.message,
      io,
      (packet) => {
        res.send(packet);
      }
    );
  });

  app.post('/api/messaging/createThread', isAuthenticatedWithJWT, (req, res) => {
    createThread(req, io, (packet) => {
      res.send(packet);
    });
  });

  app.get('/api/messaging/getLatestThreads', isAuthenticatedWithJWT, (req, res) => {
    getLatestThreads(req.user._id, (packet) => {
      res.send(packet);
    });
  });

  app.post(
    '/api/messaging/getLatestMessages',
    isAuthenticatedWithJWT,
    (req, res) => {
      getLatestMessages(req.body.conversationID, (packet) => {
        res.send(packet);
      });
    }
  );
};
