var passport = require('passport');
const mongoose = require('mongoose');

var isAuthenticated = require('../passport/middleware/isAuthenticated');
var isConfirmed = require('./middleware/isConfirmed');
var {
  confirmUser,
  unsubscribeUser,
  sendConfirmationEmail,
} = require('../interactions/registration/email-confirmation');
var {
  completeRegistrationDetails,
  completeRegistrationRequired,
  userExists,
} = require('../interactions/registration/registration-data');

var User = mongoose.model('users');

import sendPacket from '../helpers/sendPacket';
import log from '../helpers/logger';

module.exports = (app) => {
  app.post('/auth/login/local', (req, res) => {
    passport.authenticate('local-login', (err, user, info) => {
      if (user) {
        req.login(user, (err) => {
          if (err) {
            log('error', `Failed serializing ${user.email}`);
            return res.json(sendPacket(-1, 'Failed to serialize user'));
          }
          log('info', `Successfully logged in ${user.email} locally`);
          return res.json(
            sendPacket(1, 'Successfully logged in', {
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              _id: user._id,
              accessToken: info['jwtAccessToken'],
              refreshToken: info['jwtRefreshToken'],
            })
          );
        });
      } else if (info) {
        res.json(sendPacket(0, info.message));
        log('error', `User local login failed`);
      } else {
        res.json(sendPacket(-1, err));
        log('error', `User local login errored`);
      }
    })(req, res);
  });

  app.post('/auth/signup/local', (req, res) => {
    passport.authenticate('local-signup', (err, user, info) => {
      if (user) {
        req.login(user, (err) => {
          if (err) {
            log('error', `Failed serializing ${user.email}`);
          }
          log('info', `Successfully created account for ${user.email}`);
          return res.redirect('/secure-confirmed');
        });
      } else if (info) {
        res.json(sendPacket(0, info.message));
        log('error', `User local signup failed`);
      } else {
        res.json(sendPacket(-1, err));
        log('error', `User local signup errored`);
      }
    })(req, res);
  });

  app.post('/auth/signup/user-exists', async (req, res) => {
    let email = req.body.email;
    let check = await userExists(email);
    if (check) {
      res.json(sendPacket(0, 'User with this email already exists'));
      log('error', `User tried creating a duplicate account with ${email}`);
    } else {
      res.json(sendPacket(1, 'New User'));
      log('info', `There is not yet an account for ${email}`);
    }
  });

  app.post('/auth/complete-registration/required', async (req, res) => {
    const result = await completeRegistrationRequired(req.body, req.user.email);

    if (result['success'] === 1) {
      log('info', `Completed required registration for ${req.user.email}`);
    }
    return res.json(result);
  });

  app.post('/auth/complete-registration/details', async (req, res) => {
    const result = await completeRegistrationDetails(req.body, req.user.email);

    if (result['success'] === 1) {
      log('info', `Completed registration details for ${req.user.email}`);
    }
    return res.json(result);
  });

  app.get('/auth/curr-user/load', isAuthenticated, async (req, res) => {
    const email = req.user.email;
    const regComplete = req.user.work !== undefined;
    const externalComplete = req.user.university !== undefined;

    let check = await userExists(email);
    if (check) {
      res.json(
        sendPacket(1, 'Sending back current user', {
          email: email,
          regComplete: regComplete,
          externalComplete: externalComplete,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          _id: req.user._id,
        })
      );
      log('info', `Sent ${email} to frontend`);
    } else {
      res.json(sendPacket(0, 'There is no user currently logged in'));
      log('error', `There is no user currently logged in`);
    }
  });

  app.get('/confirmation/:token', async (req, res) => {
    let user = await confirmUser(req.params.token);

    if (user) {
      req.login(user, (err) => {
        if (err) {
          log('error', `Failed serializing ${user.email}`);
        }
        log('info', `Confirmed user ${user.email}`);
        return res.redirect('/profile/initialize');
      });
    } else {
      res.json(sendPacket(-1, 'There was an error processing your request'));
      log('error', `Was not able to confirm user`);
    }
  });

  app.get('/unsubscribe/:token', async (req, res) => {
    let user = await unsubscribeUser(req.params.token);

    if (user) {
      res.json(sendPacket(1, `Successfully Unsubscribed user: ${user.email}`));
      log('info', `Unsubscribed user: ${user.email}`);
    } else {
      res.json(sendPacket(-1, 'There was an error processing your request'));
      log('error', `Was not able to unsubscribe user, please try again`);
    }
  });

  app.get('/confirmation-resend', isAuthenticated, (req, res) => {
    let email = req.user.email;
    if (email) {
      sendConfirmationEmail(email);
      res.json(sendPacket(1, 'Confirmation email has been resent'));
      log('info', `Resent a confirmation email to ${email}`);
    } else {
      res.json(sendPacket(-1, 'There was an error processing your request'));
      log('error', `Resend confirmation email for ${email}`);
    }
  });

  app.get('/secure-unconfirmed', isAuthenticated, (req, res) => {
    res.json(
      sendPacket(
        1,
        'Successfully accessed secure endpoint! User needs to confirm account'
      )
    );
    log('info', `User accessed secure-unconfirmed endpoint`);
  });

  app.get('/secure-confirmed', isAuthenticated, isConfirmed, (req, res) => {
    res.json(
      sendPacket(
        1,
        'Successfully accessed secure endpoint! Account has been confirmed'
      )
    );
    log('info', `User accessed secure-confirmed endpoint`);
  });

  app.get('/logout', isAuthenticated, (req, res) => {
    let email = req.user.email;
    req.logout();
    res.json(sendPacket(1, 'Successfully logged out'));
    log('info', `Successfully logged out ${email}`);
  });
};
