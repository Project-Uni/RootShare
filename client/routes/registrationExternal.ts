var passport = require('passport')


module.exports = (app) => {
  app.get('/auth/login/linkedin', passport.authenticate('linkedin-login'), (req, res) => {
    // This will not get called because of routing to LinkedIn
  });

  app.get('/auth/callback/linkedin', passport.authenticate('linkedin-login', {
    successRedirect: '/profile/initialize',
    failureRedirect: '/register'
  }))
}