var passport = require('passport')

var isAuthenticated = require('../passport/middleware/isAuthenticated')
let { findUser, sendConfirmationEmail } = require('../interactions/email-confirmation')

module.exports = (app) => {
  // redirects should be handled by React
  app.post('/auth/login/local', passport.authenticate('local-login'), (req, res) => {
    res.json('Successfully logged in locally!')
  });

  app.post('/auth/signup/local', passport.authenticate('local-signup'), (req, res) => {
    res.json('Successfully signed up locally!')
    sendConfirmationEmail(req.body.email) // Confirmation email

    // REACT: redirect to Pre-Confirmation Page
  });

  app.post('/auth/login/linkedin', passport.authenticate('linkedin-login'), (req, res) => {
    res.json('Successfully logged in through LinkedIn!')
  });

  app.post('/auth/signup/linkedin', passport.authenticate('linkedin-signup'), (req, res) => {
    res.json('Successfully signed up through LinkedIn!')
    // REACT: redirect to Pre-Confirmation Page
  });

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