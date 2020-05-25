var passport = require('passport')

var isAuthenticated = require('../passport/middleware/isAuthenticated')
var { findUser, sendConfirmationEmail } = require('../interactions/email-confirmation')
let { completeRegistration } = require('../interactions/registration-data')

module.exports = (app) => {
  // redirects should be handled by React
  app.post('/auth/login/local', passport.authenticate('local-login'), (req, res) => {
    res.json('Successfully logged in locally!')

    // REACT: redirect to Pre-Confirmation Page if not confirmed
  });

  app.post('/auth/signup/local', passport.authenticate('local-signup'), (req, res) => {
    res.json('Successfully signed up locally!')

    // REACT: redirect to Pre-Confirmation Page if not confirmed
  });

  app.get('/auth/login/linkedin', passport.authenticate('linkedin-login'), (req, res) => {
    // This will not get called because of routing to LinkedIn
  });

  app.get('/auth/callback/linkedin', passport.authenticate('linkedin-login', {
    successRedirect: '/secure',
    failureRedirect: '/logout'
  }))

  app.get('/auth/complete-registration', (req, res) => {
    completeRegistration(req.body)

    res.json("Completed Registration")
  })

  app.get('/secure', isAuthenticated, (req, res) => {
    res.json('Successfully accessed secure endpoint!')
  })

  app.get('/logout', (req, res) => {
    req.logout()
    res.json('Successfully logged out')
  })

  app.get('/confirmation/:token', async (req, res) => {
    let user = await findUser(req.params.token)

    if (user) {
      res.json(`${user.firstName}, your account has been confirmed!`)
    } else {
      res.json("There was an error processing your request")
    }
    // REACT: redirect to Post-Confirmation Page
  })

  app.get('/confirmation-resend', isAuthenticated, (req, res) => {
    if (req.user.email) {
      sendConfirmationEmail(req.user.email) // Confirmation email
      res.json("Confirmation email has been resent")
    } else {
      res.json("There was an error processing your request")
    }

  })
}