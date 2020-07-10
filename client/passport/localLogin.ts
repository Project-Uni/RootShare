var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var User = mongoose.model('users');
var bCrypt = require('bcryptjs');

module.exports = function (passport) {
  passport.use(
    'local-login',
    new LocalStrategy(
      {
        passReqToCallback: true,
        usernameField: 'email',
      },
      function (req, email, password, done) {
        process.nextTick(function () {
          // check in mongo if a user with username exists or not
          User.findOne({ email: email }, function (err, user) {
            if (err) return done(err);
            if (!user || user === undefined || user === null) {
              return done(null, false, { message: 'User Not Found' });
            }
            if (user.hashedPassword === undefined) {
              return done(null, false, {
                message: 'User has not signed up locally',
              });
            }
            if (!isValidPassword(user, password)) {
              return done(null, false, { message: 'Invalid Password.' });
            }

            return done(null, user, { message: 'Found user and logged in' });
          });
        });
      }
    )
  );

  var isValidPassword = function (user, password) {
    if (password === user.hashedPassword) {
      return true;
    }

    return bCrypt.compareSync(password, user.hashedPassword);
  };
};
