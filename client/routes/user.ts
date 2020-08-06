import sendPacket from '../helpers/sendPacket';
const mongoose = require('mongoose');
const User = mongoose.model('users');

import { isAuthenticatedWithJWT } from '../passport/middleware/isAuthenticated';
import {
  getCurrentUser,
  getConnections,
  getConnectionSuggestions,
  getPendingRequests,
  requestConnection,
  respondConnection,
} from '../interactions/user';

import log from '../helpers/logger';

module.exports = (app) => {
  app.get('/user/getCurrent', isAuthenticatedWithJWT, (req, res) => {
    return getCurrentUser(req.user, (packet) => res.json(packet));
  });

  app.get('/user/getConnections', isAuthenticatedWithJWT, (req, res) => {
    getConnections(req.user._id, (packet) => res.send(packet));
  });

  app.get('/user/getConnectionSuggestions', isAuthenticatedWithJWT, (req, res) => {
    getConnectionSuggestions(req.user._id, (packet) => res.send(packet));
  });

  app.get('/user/getPendingRequests', isAuthenticatedWithJWT, (req, res) => {
    getPendingRequests(req.user._id, (packet) => res.send(packet));
  });

  app.post('/user/requestConnection', isAuthenticatedWithJWT, (req, res) => {
    requestConnection(req.user._id, req.body.requestID, (packet) =>
      res.send(packet)
    );
  });

  app.post('/user/respondConnection', isAuthenticatedWithJWT, (req, res) => {
    respondConnection(
      req.user._id,
      req.body.requestID,
      req.body.accepted,
      (packet) => res.send(packet)
    );
  });

  app.post('/api/getMatchingUsers', isAuthenticatedWithJWT, (req, res) => {
    const { query } = req.body;
    if (!query || query === '') return res.json(sendPacket(0, 'Invalid query'));

    const queryTerms = query.split(' ');
    const searchParams = [];

    const firstRegex = new RegExp(queryTerms[0], 'g');
    searchParams.push({ firstName: firstRegex });
    //TODO - email search doesn't work like this. Leaving this as is for now
    searchParams.push({ email: firstRegex });

    if (queryTerms.length > 1) {
      const secondRegex = new RegExp(queryTerms[1], 'g');
      searchParams.push({ lastName: secondRegex });
    } else searchParams.push({ lastName: firstRegex });

    User.find({ $or: searchParams }, (err, users) => {
      if (err) {
        log('error', err);
        return res.json(sendPacket(-1, 'Error fetching users from DB'));
      }
      return res.json(
        sendPacket(1, 'Received request', {
          users: users
            .map((user) => ({
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              _id: user._id,
            }))
            .slice(0, 10),
        })
      );
    });
  });
};
