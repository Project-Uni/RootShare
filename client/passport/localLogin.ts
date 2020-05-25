var LocalStrategy = require('passport-local').Strategy
var mongoose = require('mongoose')
var User = mongoose.model('users')
var bCrypt = require('bcryptjs')

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
            // In case of any error, return using the done method
            if (err)
              return done(err);
            // Username does not exist, log the error and redirect back
            if (!user) {
              console.log('User Not Found with email address ' + email);
              return done(null, false, { message: 'User Not Found' });
            }
            if (user.hashedPassword === undefined) {
              console.log("User has not signed up locally")
              return done(null, false, { message: 'User has not signed up locally' });
            }
            // User is not yet confirmed, log the error and remind to confirm
            // if (!user.confirmed) {
            //   console.log('Please confirm your email address');
            //   return done(null, false, { message: 'User Not Confirmed.' });
            // }
            // User exists but wrong password, log the error 
            if (!isValidPassword(user, password)) {
              console.log('Invalid Password');
              return done(null, false, { message: 'Invalid Password.' }); // redirect back to login page
            }
            // User and password both match, return user from done method
            // which will be treated like success
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