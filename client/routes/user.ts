import sendPacket from '../helpers/sendPacket';
const mongoose = require('mongoose');
const User = mongoose.model('users');

import {
  isAuthenticated,
  isAuthenticatedWithJWT,
} from '../passport/middleware/isAuthenticated';
import { getCurrentUser, getConnections } from '../interactions/user';

import log from '../helpers/logger';

module.exports = (app) => {
  app.get('/user/getCurrent', isAuthenticatedWithJWT, (req, res) => {
    const user = req.user;
    if (!user) return res.json(sendPacket(0, 'User not found'));
    return res.json(
      sendPacket(1, 'Found currentUser', {
        email: user.email,
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        privilegeLevel: user.privilegeLevel || 1,
        accountType: user.accountType,
      })
    );
  });

  //TODO - Authenticate With JWT
  app.get('/user/getConnections', (req, res) => {
    getConnections(req.user, (packet) => res.send(packet));
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
