const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const { LINKEDIN_KEY, LINKEDIN_SECRET } = require('../../keys/keys.json');
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
        if (!user) {
          log('LINKEDIN REG', `New email address, creating account with ${email}`);
          let newUser = await createNewUserLinkedIn(
            firstName,
            lastName,
            email,
            linkedinID
          );

          const JWT = generateJWT(newUser);
          sendConfirmationEmail(email);
          return done(null, newUser, {
            message: 'User Registration with LinkedIn Succesful!',
            jwtAccessToken: JWT.accessToken,
            jwtRefreshToken: JWT.refreshToken,
          });
        }

        if (user.linkedinID === undefined) {
          log('LINKEDIN REG', 'Found user and adding LinkedIn ID');
          user.linkedinID = linkedinID;
          user.save();

          const JWT = generateJWT(user);
          sendExternalAdditionConfirmation(email, 'LinkedIn');
          return done(null, user, {
            message: 'User Login with LinkedIn Succesful!',
            jwtAccessToken: JWT.accessToken,
            jwtRefreshToken: JWT.refreshToken,
          });
        }

        if (!isValidLinkedInID(user, linkedinID)) {
          log('LINKEDIN REG ERROR', 'Invalid LinkedIn Account');
          return done(null, false, { message: 'Invalid LinkedIn Account' }); // redirect back to login page
        }

        log('LINKEDIN REG', 'Found user and sending back!');

        const JWT = generateJWT(user);
        return done(null, user, {
          message: 'User Login with LinkedIn Succesful!',
          jwtAccessToken: JWT.accessToken,
          jwtRefreshToken: JWT.refreshToken,
        });
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
    // Set this as default until it's changed by the user
    newUser.university = PURDUE_ID;

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
