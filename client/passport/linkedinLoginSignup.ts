var LinkedInStrategy = require('passport-linkedin-oauth2').Strategy
const { LINKEDIN_KEY, LINKEDIN_SECRET } = require('../../keys/keys.json')
var mongoose = require('mongoose')
var User = mongoose.model('users')
import log from '../helpers/logger'

module.exports = (passport) => {
  passport.use('linkedin-login', new LinkedInStrategy({
    clientID: LINKEDIN_KEY,
    clientSecret: LINKEDIN_SECRET,
    callbackURL: "/auth/callback/linkedin",
    scope: ['r_emailaddress', 'r_liteprofile'],
    state: true
  }, function (accessToken, refreshToken, profile, done) {
    // process.nextTick(function () {
    let email = profile.emails[0].value
    let linkedinID = profile.id
    let firstName = profile.name.givenName
    let lastName = profile.name.familyName

    User.findOne({ 'email': email },
      function (err, user) {
        if (err)
          return done(err);
        if (!user) {
          log('LINKEDIN REG', `New email address, creating account with ${email}`);
          let newUser = createNewUserLinkedIn(firstName, lastName, email, linkedinID)
          return done(null, newUser)
        }
        if (user.linkedinID === undefined) {
          log('LINKEDIN REG', 'Account has not been set up with LinkedIn');
          return done(null, false, { message: 'Account has not been set up with LinkedIn' });
        }
        if (!isValidLinkedInID(user, linkedinID)) {
          log('LINKEDIN REG ERROR', 'Invalid LinkedIn Account');
          return done(null, false, { message: 'Invalid LinkedIn Account' }); // redirect back to login page
        }

        log('LINKEDIN REG', 'Found user and sending back!')
        return done(null, user);
      }
    );
    // })
  }))

  var isValidLinkedInID = (user, linkedinID) => {
    return (user.linkedinID.localeCompare(linkedinID) === 0)
  }

  var createNewUserLinkedIn = (firstName, lastName, email, linkedinID) => {
    // create the user
    var newUser = new User();

    // set the user's required credentials
    newUser.firstName = firstName
    newUser.lastName = lastName
    newUser.email = email
    newUser.linkedinID = linkedinID
    newUser.confirmed = true

    // save the user
    newUser.save(function (err) {
      if (err) {
        log('MONGO ERROR', `Error in Saving user: ${err}`);
        throw err
      }

      log('LINKEDIN REG', 'User Registration Succesful!');
      return newUser
    });

    return newUser
  }
}