var LinkedInStrategy = require('passport-linkedin-oauth2')
const { LINKEDIN_KEY, LINKEDIN_SECRET } = require('../../keys')

passport.use('linkedin-login', new LinkedInStrategy({
  clientID: LINKEDIN_KEY,
  clientSecret: LINKEDIN_SECRET,
  callbackURL: "http://127.0.0.1:8000/auth/linkedin/callback",
  scope: ['r_emailaddress', 'r_liteprofile'],
  state: true
}, function (accessToken, refreshToken, profile, done) {
  process.nextTick(function () {
    // TODO: add user to database


    return done(null, profile) // TODO: profile should be the found user in the database
  })
}))