var passport = require('passport')
import axios from 'axios'

var isAuthenticated = require('../passport/middleware/isAuthenticated')
var isConfirmed = require('./middleware/isConfirmed')
var { findUser, sendConfirmationEmail } = require('../interactions/email-confirmation')
var { completeRegistrationDetails, completeRegistrationRequired, userExists } = require('../interactions/registration-data')
import sendPacket from '../helpers/sendPacket'
import log from '../helpers/logger'

module.exports = (app) => {
  app.post('/auth/login/local', (req, res) => {
    passport.authenticate('local-login', (err, user, info) => {
      if (user) {
        req.login(user, (err) => {
          if (err) { log("error", `Failed serializing ${user.email}`) }
          log("info", `Successfully logged in ${user.email} locally`)
          return res.redirect('/secure-confirmed')
        })
      } else if (info) {
        res.json(sendPacket(0, info.message))
        log("error", `User local login failed`)
      } else {
        res.json(sendPacket(-1, err))
        log("error", `User local login errored`)
      }
    })(req, res)
  });

  app.post('/auth/signup/local', (req, res) => {
    passport.authenticate('local-signup', (err, user, info) => {
      if (user) {
        req.login(user, (err) => {
          if (err) { log("error", `Failed serializing ${user.email}`) }
          log("info", `Successfully created account for ${user.email}`)
          return res.redirect('/secure-confirmed')
        })
      } else if (info) {
        res.json(sendPacket(0, info.message))
        log("error", `User local signup failed`)
      } else {
        res.json(sendPacket(-1, err))
        log("error", `User local signup errored`)
      }
    })(req, res)
  });

  app.post('/auth/signup/user-exists', async (req, res) => {
    let email = req.body.email
    let check = await userExists(email)
    if (check) {
      res.json(sendPacket(0, "User with this email already exists"))
      log("error", `User tried creating a duplicate account with ${email}`)
    } else {
      res.json(sendPacket(1, "New User"))
      log("info", `There is not yet an account for ${email}`)
    }
  })

  app.post('/auth/complete-registration/required', (req, res) => {
    completeRegistrationRequired(req.body)

    res.json(sendPacket(1, "Completed Required Registration"))
    log("info", `Completed required registration for ${req.body.email}`)
  })

  app.post('/auth/complete-registration/details', (req, res) => {
    completeRegistrationDetails(req.body)

    res.json(sendPacket(1, "Completed Additional Details Registration"))
    log("info", `Filled out additional details for ${req.body.email}`)
  })

  app.get('/confirmation/:token', async (req, res) => {
    let user = await findUser(req.params.token)

    if (user) {
      req.login(user, (err) => {
        if (err) { log("error", `Failed serializing ${user.email}`) }
        log("info", `Confirmed user ${user.email}`)
        return res.redirect('/secure-confirmed')
      })
    } else {
      res.json(sendPacket(-1, "There was an error processing your request"))
      log("error", `Was not able to confirm user`)
    }
  })

  app.get('/confirmation-resend', isAuthenticated, (req, res) => {
    let email = req.user.email
    if (email) {
      sendConfirmationEmail(email)
      res.json(sendPacket(1, "Confirmation email has been resent"))
      log("info", `Resent a confirmation email to ${email}`)
    } else {
      res.json(sendPacket(-1, "There was an error processing your request"))
      log("error", `Resend confirmation email for ${email}`)
    }
  })

  app.get('/secure-unconfirmed', isAuthenticated, (req, res) => {
    res.json(sendPacket(1, 'Successfully accessed secure endpoint! User needs to confirm account'))
    log("info", `User accessed secure-unconfirmed endpoint`)
  })

  app.get('/secure-confirmed', isAuthenticated, isConfirmed, (req, res) => {
    res.json(sendPacket(1, 'Successfully accessed secure endpoint! Account has been confirmed'))
    log("info", `User accessed secure-confirmed endpoint`)
  })

  app.get('/logout', (req, res) => {
    let email = req.user.email
    req.logout()
    res.json(sendPacket(1, 'Successfully logged out'))
    log("info", `Successfully logged out ${email}`)
  })
}