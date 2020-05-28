var LocalStrategy = require('passport-local').Strategy
var mongoose = require('mongoose')
var User = mongoose.model('users')
var bCrypt = require('bcryptjs')
import log from '../helpers/logger'

module.exports = function (passport) {

  passport.use('local-login', new LocalStrategy({
    passReqToCallback: true,
    usernameField: 'email',
  },
    function (req, email, password, done) {
      process.nextTick(function () {
        // check in mongo if a user with username exists or not
        User.findOne({ 'email': email },
          function (err, user) {
            if (err)
              return done(err);
            if (!user) {
              log('LOCAL LOGIN ERROR', `User Not Found with email address ${email}`);
              return done(null, false, { message: 'User Not Found' });
            }
            if (user.hashedPassword === undefined) {
              log('LOCAL LOGIN ERROR', 'User has not signed up locally')
              return done(null, false, { message: 'User has not signed up locally' });
            }
            if (!isValidPassword(user, password)) {
              log('LOCAL LOGIN ERROR', 'Invalid Password');
              return done(null, false, { message: 'Invalid Password.' }); // redirect back to login page
            }

            log('LOCAL LOGIN', 'Found user and sending back!')
            return done(null, user);
          }
        );
      }

      )
    })
  );

  var isValidPassword = function (user, password) {
    return bCrypt.compareSync(password, user.hashedPassword);
  }
}