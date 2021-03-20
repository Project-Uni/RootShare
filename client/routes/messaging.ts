import { getUserFromJWT, log } from '../helpers/functions';

import { isAuthenticatedWithJWT } from '../passport/middleware/isAuthenticated';
const {
  createThread,
  sendMessage,
  getLatestThreads,
  getLatestMessages,
  updateLike,
  getLiked,
  connectSocketToConversations,
} = require('../interactions/messaging');

export default function messagingRoutes(app, io) {
  io.on('connection', (socket) => {
    log('info', 'New client connected');

    socket.on('initialConnect', (conversations, userID) => {
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
    const { _id: userID } = getUserFromJWT(req);

    sendMessage(
      userID,
      req.body.conversationID,
      req.body.message,
      req.body.tempID,
      io,
      (packet) => {
        res.json(packet);
      }
    );
  });

  app.post('/api/messaging/createThread', isAuthenticatedWithJWT, (req, res) => {
    createThread(req, io, (packet) => {
      res.json(packet);
    });
  });

  app.get('/api/messaging/getLatestThreads', isAuthenticatedWithJWT, (req, res) => {
    const { _id: userID } = getUserFromJWT(req);

    getLatestThreads(userID, (packet) => {
      res.json(packet);
    });
  });

  app.post(
    '/api/messaging/getLatestMessages',
    isAuthenticatedWithJWT,
    (req, res) => {
      const { _id: userID } = getUserFromJWT(req);

      getLatestMessages(
        userID,
        req.body.conversationID,
        req.body.maxMessages,
        (packet) => {
          res.json(packet);
        }
      );
    }
  );

  app.post('/api/messaging/updateLike', isAuthenticatedWithJWT, (req, res) => {
    const { _id: userID } = getUserFromJWT(req);

    updateLike(userID, req.body.messageID, req.body.liked, io, (packet) => {
      res.json(packet);
    });
  });

  app.post('/api/messaging/getLiked', isAuthenticatedWithJWT, (req, res) => {
    const { _id: userID } = getUserFromJWT(req);

    getLiked(userID, req.body.conversationID, (packet) => {
      res.json(packet);
    });
  });
}
