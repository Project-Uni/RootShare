var LinkedInStrategy = require('passport-linkedin-oauth2').Strategy
const { LINKEDIN_KEY, LINKEDIN_SECRET } = require('../../keys/keys.json')
var mongoose = require('mongoose')
var User = mongoose.model('users')

module.exports = (passport) => {
  passport.use('linkedin-login', new LinkedInStrategy({
    clientID: LINKEDIN_KEY,
    clientSecret: LINKEDIN_SECRET,
    callbackURL: "http://127.0.0.1:8000/auth/callback/linkedin",
    scope: ['r_emailaddress', 'r_liteprofile'],
    state: true
  }, function (accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      let email = profile.emails[0].value
      let linkedinID = profile.id
      let firstName = profile.name.givenName
      let lastName = profile.name.familyName
      console.log(email)
      console.log(linkedinID)


      User.findOne({ 'email': email },
        async function (err, user) {
          if (err)
            return done(err);
          if (!user) {
            console.log('New email address, creating account with ' + email);
            let newUser = await createNewUserLinkedIn(firstName, lastName, email, linkedinID)
            return done(null, newUser)
          }
          if (user.linkedinID.localeCompare("undefined") === 0) {
            console.log('Account has not been set up with LinkedIn');
            return done(null, false, { message: 'Account has not been set up with LinkedIn' });
          }
          if (!isValidLinkedInID(user, linkedinID)) {
            console.log('Invalid LinkedIn Account');
            return done(null, false, { message: 'Invalid LinkedIn Account' }); // redirect back to login page
          }

          console.log("Found user and sending back!")
          return done(null, user);
        }
      );
    })
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
        console.log('Error in Saving user: ' + err);
        throw err
      }

      console.log('User Registration succesful');
      return newUser
    });

    return newUser
  }
}