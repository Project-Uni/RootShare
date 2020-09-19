const GoogleStrategy = require('passport-google-oauth2').Strategy;
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = require('../../keys/keys.json');
const mongoose = require('mongoose');
const User = mongoose.model('users');
import { log, generateJWT } from '../helpers/functions';

const {
  sendConfirmationEmail,
  sendExternalAdditionConfirmation,
} = require('../interactions/registration/email-confirmation');

const PURDUE_ID = '5eb89c308cc6636630c1311f';

module.exports = (passport) => {
  passport.use(
    'google-login',
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL:
          process.env.NODE_ENV === 'dev'
            ? '/auth/callback/google'
            : 'https://rootshare.io/auth/callback/google',
      },
      async function (accessToken, refreshToken, profile, done) {
        let email = profile.emails[0].value.toLowerCase();
        let googleID = profile.id;
        let firstName = profile.name.givenName;
        let lastName = profile.name.familyName;

        const user = await User.findOne({ email: email });
        if (!user) {
          log('GOOGLE REG', `New email address, creating account with ${email}`);
          let newUser = await createNewUserGoogle(
            firstName,
            lastName,
            email,
            googleID
          );

          const JWT = generateJWT(newUser);
          sendConfirmationEmail(email);
          return done(null, newUser, {
            message: 'User Registration with Google Succesful!',
            jwtAccessToken: JWT.accessToken,
            jwtRefreshToken: JWT.refreshToken,
          });
        }

        if (user.googleID === undefined) {
          log('GOOGLE REG', 'Found user and adding Google ID');
          user.googleID = googleID;
          user.save();

          const JWT = generateJWT(user);
          sendExternalAdditionConfirmation(email, 'Google');
          return done(null, user, {
            message: 'User Login with Google Succesful!',
            jwtAccessToken: JWT.accessToken,
            jwtRefreshToken: JWT.refreshToken,
          });
        }

        if (!isValidGoogleID(user, googleID)) {
          log('Google REG ERROR', 'Invalid Google Account');
          return done(null, false, { message: 'Invalid Google Account' }); // redirect back to login page
        }

        log('GOOGLE REG', 'Found user and sending back!');

        const JWT = generateJWT(user);
        return done(null, user, {
          message: 'User Login with Google Succesful!',
          jwtAccessToken: JWT.accessToken,
          jwtRefreshToken: JWT.refreshToken,
        });
      }
    )
  );

  var isValidGoogleID = (user, googleID) => {
    return user.googleID.localeCompare(googleID) === 0;
  };

  var createNewUserGoogle = async (firstName, lastName, email, googleID) => {
    // create the user
    var newUser = new User();

    // set the user's required credentials
    newUser.firstName = firstName;
    newUser.lastName = lastName;
    newUser.email = email;
    newUser.googleID = googleID;
    // Set these as defaults until they're changed by the user
    newUser.university = PURDUE_ID;
    newUser.accountType = 'student';

    // save the user
    await newUser.save((err) => {
      if (err) {
        log('MONGO ERROR', `Error in Saving user: ${err}`);
        throw err;
      }
    });
    log('GOOGLE REG', 'User Registration Succesful!');
    return newUser;
  };
};
