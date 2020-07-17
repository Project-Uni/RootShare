const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const { LINKEDIN_KEY, LINKEDIN_SECRET } = require('../../keys/keys.json');
const mongoose = require('mongoose');
const User = mongoose.model('users');
import log from '../helpers/logger';

module.exports = (passport) => {
  // const callbackURL =
  //   process.env.NODE_ENV && process.env.NODE_ENV === "dev"
  //     ? "/auth/callback/linkedin"
  //     : "https://rootshare.io/auth/callback/linkedin";
  passport.use(
    'linkedin-login',
    new LinkedInStrategy(
      {
        clientID: LINKEDIN_KEY,
        clientSecret: LINKEDIN_SECRET,
        callbackURL: 'https://rootshare.io/auth/callback/linkedin',
        scope: ['r_emailaddress', 'r_liteprofile'],
        state: true,
      },
      async function (accessToken, refreshToken, profile, done) {
        let email = profile.emails[0].value;
        let linkedinID = profile.id;
        let firstName = profile.name.givenName;
        let lastName = profile.name.familyName;

        const user = await User.findOne({ email: email });
        if (!user || user === undefined || user === null) {
          log('LINKEDIN REG', `New email address, creating account with ${email}`);
          let newUser = await createNewUserLinkedIn(
            firstName,
            lastName,
            email,
            linkedinID
          );
          return done(null, newUser);
        }

        if (user.linkedinID === undefined) {
          log('LINKEDIN REG', 'Account has not been set up with LinkedIn');
          return done(null, false, {
            message: 'Account has not been set up with LinkedIn',
          });
        }
        if (!isValidLinkedInID(user, linkedinID)) {
          log('LINKEDIN REG ERROR', 'Invalid LinkedIn Account');
          return done(null, false, { message: 'Invalid LinkedIn Account' }); // redirect back to login page
        }

        log('LINKEDIN REG', 'Found user and sending back!');
        return done(null, user);
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
    newUser.confirmed = true;

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
