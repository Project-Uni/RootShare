var passport = require('passport')

var isAuthenticated = require('../passport/middleware/isAuthenticated')
var isConfirmed = require('./middleware/isConfirmed')
var { findUser, sendConfirmationEmail } = require('../interactions/email-confirmation')
var { completeRegistration } = require('../interactions/registration-data')

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

  app.post('/auth/complete-registration', (req, res) => {
    completeRegistration(req.body)

    res.json("Completed Registration")
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

  app.get('/secure-unconfirmed', isAuthenticated, (req, res) => {
    res.json('Successfully accessed secure endpoint! User needs to confirm account')
  })

  app.get('/secure-confirmed', isAuthenticated, isConfirmed, (req, res) => {
    res.json('Successfully accessed secure endpoint! Account has been confirmed')
  })

  app.get('/logout', (req, res) => {
    req.logout()
    res.json('Successfully logged out')
  })
}