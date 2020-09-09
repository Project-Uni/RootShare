var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var User = mongoose.model('users');
var University = mongoose.model('universities');

import { sendConfirmationEmail } from '../interactions/registration/email-confirmation';
import { generateJWT, hashPassword } from '../helpers/functions';
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
            newUser.hashedPassword = hashPassword(password);
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
};
