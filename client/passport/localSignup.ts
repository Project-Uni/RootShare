var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose')
var User = mongoose.model('users')
var bCrypt = require('bcryptjs');
import log from '../helpers/logger'

var { sendConfirmationEmail } = require('../interactions/email-confirmation')

module.exports = function (passport) {

  passport.use('local-signup', new LocalStrategy({
    passReqToCallback: true, // allows us to pass back the entire request to the callback
    usernameField: 'email'
  },
    function (req, email, password, done) {

      function findOrCreateUser() {
        // find a user in Mongo with provided email address
        User.findOne({ 'email': email }, function (err, user) {
          if (err) {
            return done(err);
          }
          if (user) {
            return done(null, false, { message: 'User Already Exists.' });
          } else {
            // if there is no user with that email, create new
            var newUser = new User();

            // set the user's required credentials
            newUser.firstName = req.body['firstName']
            newUser.lastName = req.body['lastName']
            newUser.email = email;
            newUser.hashedPassword = createHash(password);

            // save the user
            newUser.save(function (err) {
              if (err) {
                return done(err);
              }

              sendConfirmationEmail(email)
              return done(null, newUser, { message: 'User Registration Succesful!' });
            });
          }
        });
      };

      process.nextTick(findOrCreateUser);
    })
  );

  // Generates hash using bCrypt
  var createHash = function (password) {
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
  }

}