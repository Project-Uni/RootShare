var passport = require('passport')

var isAuthenticated = require('../passport/middleware/isAuthenticated')
var isConfirmed = require('./middleware/isConfirmed')
import sendPacket from '../helpers/sendPacket'
var { findUser, sendConfirmationEmail } = require('../interactions/email-confirmation')
var { completeRegistration, userExists } = require('../interactions/registration-data')

module.exports = (app) => {
  app.post('/auth/login/local', (req, res) => {
    passport.authenticate('local-login', (err, user, info) => {
      if (user) {
        res.json(sendPacket(1, info.message))
      } else if (info) {
        res.json(sendPacket(0, info.message))
      } else {
        res.json(sendPacket(-1, err))
      }
    })(req, res)
  });

  app.post('/auth/signup/local', (req, res) => {
    passport.authenticate('local-signup', (err, user, info) => {
      if (user) {
        res.json(sendPacket(1, info.message))
      } else if (info) {
        res.json(sendPacket(0, info.message))
      } else {
        res.json(sendPacket(-1, err))
      }
    })(req, res)
  });

  app.post('/auth/signup/user-exists', async (req, res) => {
    let check = await userExists(req.body.email)
    if (check) {
      res.json(sendPacket(0, "User with this email already exists"))
    } else {
      res.json(sendPacket(1, "New User"))
    }
  })

  app.post('/auth/complete-registration', (req, res) => {
    completeRegistration(req.body)

    res.json(sendPacket(1, "Completed Registration"))
  })

  app.get('/confirmation/:token', async (req, res) => {
    let user = await findUser(req.params.token)

    if (user) {
      res.redirect('/secure-confirmed')
    } else {
      res.json(sendPacket(-1, "There was an error processing your request"))
    }
  })

  app.get('/confirmation-resend', isAuthenticated, (req, res) => {
    if (req.user.email) {
      sendConfirmationEmail(req.user.email)
      res.json(sendPacket(1, "Confirmation email has been resent"))
    } else {
      res.json(sendPacket(-1, "There was an error processing your request"))
    }
  })

  app.get('/secure-unconfirmed', isAuthenticated, (req, res) => {
    res.json(sendPacket(1, 'Successfully accessed secure endpoint! User needs to confirm account'))
  })

  app.get('/secure-confirmed', isAuthenticated, isConfirmed, (req, res) => {
    res.json(sendPacket(1, 'Successfully accessed secure endpoint! Account has been confirmed'))
  })

  app.get('/logout', (req, res) => {
    req.logout()
    res.json(sendPacket(1, 'Successfully logged out'))
  })
}