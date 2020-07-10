import sendPacket from '../helpers/sendPacket';
const mongoose = require('mongoose');
const User = mongoose.model('users');

const isAuthenticated = require('../passport/middleware/isAuthenticated');

import log from '../helpers/logger';

module.exports = (app) => {
  app.get('/user/getCurrent', (req, res) => {
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

  app.post('/api/getMatchingUsers', isAuthenticated, (req, res) => {
    const { query } = req.body;
    if (!query || query === '') return res.json(sendPacket(0, 'Invalid query'));

    const queryTerms = query.split(' ');
    const searchParams = [];

    const firstRegex = new RegExp(queryTerms[0], 'g');
    searchParams.push({ firstName: firstRegex });
    //TODO - email search doesn't work like this. Leaving this as is for now
    searchParams.push({ email: firstRegex });

    console.log('First regex:', firstRegex);
    if (queryTerms.length > 1) {
      const secondRegex = new RegExp(queryTerms[1], 'g');
      searchParams.push({ lastName: secondRegex });
      console.log('secondRegex:', secondRegex);
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
