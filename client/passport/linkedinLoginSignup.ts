const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const { LINKEDIN_KEY, LINKEDIN_SECRET } = require('../../keys/keys.json');
const mongoose = require('mongoose');
const User = mongoose.model('users');
import log from '../helpers/logger';
import jwt = require('jsonwebtoken');

const {
  sendConfirmationEmail,
} = require('../interactions/registration/email-confirmation');

import { JWT_TOKEN_FIELDS, JWT_ACCESS_TOKEN_TIMEOUT } from '../types/types';

module.exports = (passport) => {
  passport.use(
    'linkedin-login',
    new LinkedInStrategy(
      {
        clientID: LINKEDIN_KEY,
        clientSecret: LINKEDIN_SECRET,
        callbackURL:
          process.env.NODE_ENV === 'dev'
            ? '/auth/callback/linkedin'
            : 'https://rootshare.io/auth/callback/linkedin',
        scope: ['r_emailaddress', 'r_liteprofile'],
        state: true,
      },
      async function (accessToken, refreshToken, profile, done) {
        let email = profile.emails[0].value.toLowerCase();
        let linkedinID = profile.id;
        let firstName = profile.name.givenName;
        let lastName = profile.name.familyName;

        const user = await User.findOne({ email: email });
        if (!user || user === undefined || user === null) {
          log('LINKEDIN REG', `New email address, creating account with ${email}`);
          let newUser = await createNewUserLinkedIn(
            firstName,
            lastName,
            email,
            linkedinID
          );

          const userTokenInfo = {};
          for (let i = 0; i < JWT_TOKEN_FIELDS.length; i++)
            userTokenInfo[JWT_TOKEN_FIELDS[i]] = newUser[JWT_TOKEN_FIELDS[i]];
          const jwtAccessToken = jwt.sign(
            userTokenInfo,
            process.env.JWT_ACCESS_SECRET
            // { expiresIn: JWT_ACCESS_TOKEN_TIMEOUT }
          );
          const jwtRefreshToken = jwt.sign(
            userTokenInfo,
            process.env.JWT_REFRESH_SECRET
          );

          sendConfirmationEmail(email);
          return done(null, newUser, {
            message: 'User Registration with LinkedIn Succesful!',
            jwtAccessToken,
            jwtRefreshToken,
          });
        }

        if (user.linkedinID === undefined) {
          log('LINKEDIN REG', 'Found user and adding LinkedIn ID');
          user.linkedinID = linkedinID;
          user.save();

          const userTokenInfo = {};
          for (let i = 0; i < JWT_TOKEN_FIELDS.length; i++)
            userTokenInfo[JWT_TOKEN_FIELDS[i]] = user[JWT_TOKEN_FIELDS[i]];
          const jwtAccessToken = jwt.sign(
            userTokenInfo,
            process.env.JWT_ACCESS_SECRET
            // { expiresIn: JWT_ACCESS_TOKEN_TIMEOUT }
          );
          const jwtRefreshToken = jwt.sign(
            userTokenInfo,
            process.env.JWT_REFRESH_SECRET
          );
          return done(null, user, {
            message: 'User Login with LinkedIn Succesful!',
            jwtAccessToken,
            jwtRefreshToken,
          });
        }
        if (!isValidLinkedInID(user, linkedinID)) {
          log('LINKEDIN REG ERROR', 'Invalid LinkedIn Account');
          return done(null, false, { message: 'Invalid LinkedIn Account' }); // redirect back to login page
        }
      }
    )
  );

  var isValidLinkedInID = (user, linkedinID) => {
    return user.linkedinID.localeCompare(linkedinID) === 0;
  };

  var createNewUserLinkedIn = async (firstName, lastName, email, linkedinID) => {
    // create the user
    var newUser = new User();

    // set the user's required credentials
    newUser.firstName = firstName;
    newUser.lastName = lastName;
    newUser.email = email;
    newUser.linkedinID = linkedinID;

    // save the user
    await newUser.save((err) => {
      if (err) {
        log('MONGO ERROR', `Error in Saving user: ${err}`);
        throw err;
      }
    });
    log('LINKEDIN REG', 'User Registration Succesful!');
    return newUser;
  };
};
