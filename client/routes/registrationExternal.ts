var passport = require('passport');

import { log, sendPacket } from '../helpers/functions';
import { resetLockAuth } from '../interactions/registration/email-confirmation';

module.exports = (app) => {
  app.get('/auth/login/linkedin', passport.authenticate('linkedin-login'));

  app.get('/auth/callback/linkedin', (req, res) => {
    passport.authenticate('linkedin-login', (err, user, info) => {
      if (user) {
        req.login(user, (err) => {
          if (err) {
            log('error', `Failed serializing ${user.email}`);
          }
          log('info', `Successfully serialized ${user.email}`);

          return res.redirect(
            `/register/external?accessToken=${info['jwtAccessToken']}&refreshToken=${info['jwtRefreshToken']}`
          );
        });
      } else if (info) {
        res.json(sendPacket(0, info.message));
        log('error', `User linkedin login-signup failed`);
      } else {
        res.json(sendPacket(-1, err));
        log('error', `User linkedin login-signup errored`);
      }
    })(req, res);
  });

  app.get(
    '/auth/login/google',
    passport.authenticate('google-login', {
      scope: ['profile', 'email'],
    })
  );

  app.get('/auth/callback/google', (req, res) => {
    passport.authenticate('google-login', (err, user, info) => {
      if (user) {
        req.login(user, (err) => {
          if (err) {
            log('error', `Failed serializing ${user.email}`);
          }
          log('info', `Successfully serialized ${user.email}`);

          return res.redirect(
            `/register/external?accessToken=${info['jwtAccessToken']}&refreshToken=${info['jwtRefreshToken']}`
          );
        });
      } else if (info) {
        res.json(sendPacket(0, info.message));
        log('error', `User google login-signup failed`);
      } else {
        res.json(sendPacket(-1, err));
        log('error', `User google login-signup errored`);
      }
    })(req, res);
  });

  app.get('/auth/reset/Google/:token', async (req, res) => {
    resetLockAuth(req.params.token, 'Reset', 'Google', (packet) => {
      res.json(packet);
    });
  });

  app.get('/auth/lock/Google/:token', async (req, res) => {
    resetLockAuth(req.params.token, 'Locked', 'Google', (packet) => {
      res.json(packet);
    });
  });

  app.get('/auth/reset/LinkedIn/:token', async (req, res) => {
    resetLockAuth(req.params.token, 'Reset', 'LinkedIn', (packet) => {
      res.json(packet);
    });
  });

  app.get('/auth/lock/LinkedIn/:token', async (req, res) => {
    resetLockAuth(req.params.token, 'Locked', 'LinkedIn', (packet) => {
      res.json(packet);
    });
  });
};
