var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var User = mongoose.model('users');
var University = mongoose.model('universities');
var bCrypt = require('bcryptjs');

import { sendConfirmationEmail } from '../interactions/registration/email-confirmation';
import { generateJWT } from '../helpers/generateJWT';

module.exports = function (passport) {
  passport.use(
    'local-signup',
    new LocalStrategy(
      {
        passReqToCallback: true, // allows us to pass back the entire request to the callback
        usernameField: 'email',
      },
      function (req, email, password, done) {
        function findOrCreateUser() {
          // find a user in Mongo with provided email address
          email = email.toLowerCase();
          User.findOne({ email: email }, async function (err, user) {
            if (err) return done(err);
            if (user) return done(null, false, { message: 'Email Already Exists.' });

            var newUser = new User();
            // set the user's required credentials
            newUser.firstName = req.body.firstName;
            newUser.lastName = req.body.lastName;
            newUser.email = email;
            newUser.hashedPassword = createHash(password);
            newUser.accountType = req.body.accountType;

            let university = await University.findOne({
              universityName: req.body.university,
            });
            if (!university || university === undefined || university === null) {
              return done(null, false, { message: 'University Not Found' });
            }
            newUser.university = university;

            newUser.save(function (err) {
              if (err) {
                return done(err);
              }

              const JWT = generateJWT(newUser);
              sendConfirmationEmail(email);
              return done(null, newUser, {
                message: 'User Registration Succesful!',
                jwtAccessToken: JWT.accessToken,
                jwtRefreshToken: JWT.refreshToken,
              });
            });
          });
        }

        process.nextTick(findOrCreateUser);
      }
    )
  );

  // Generates hash using bCrypt
  var createHash = function (password) {
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
  };
};
