var passport = require('passport');

import { log, sendPacket } from '../helpers/functions';
import { resetLockAuth } from '../interactions/registration/email-confirmation';

module.exports = (app) => {
  app.get('/auth/login/linkedin', (req, res, next) => {
    const redirect = req.query.redirect || '/home';
    const state = Buffer.from(JSON.stringify({ redirect })).toString('base64');
    passport.authenticate('linkedin-login', { state })(req, res, next);
  });

  app.get('/auth/callback/linkedin', (req, res) => {
    passport.authenticate('linkedin-login', (err, user, info) => {
      const { state } = req.query;
      const { redirect } = JSON.parse(Buffer.from(state, 'base64').toString());
      if (typeof redirect !== 'string' || !redirect.startsWith('/'))
        return res.redirect('/');

      if (user) {
        // https://github.com/jaredhanson/passport/issues/306
        // Sometimes user still gets redirected to landing page on external signup
        // Cause: Redirect sometimes happens before session gets saved
        const tokenString = `accessToken=${info['jwtAccessToken']}&refreshToken=${info['jwtRefreshToken']}`;
        if (user.work === undefined || user.work === null)
          return res.redirect(`/register/external?${tokenString}`);
        return res.redirect(`/login?redirect=${redirect}&${tokenString}`);
      } else if (info) {
        res.json(sendPacket(0, info.message));
        log('error', `User linkedin login-signup failed`);
      } else {
        res.json(sendPacket(-1, err));
        log('error', `User linkedin login-signup errored`);
      }
    })(req, res);
  });

  app.get('/auth/login/google', (req, res, next) => {
    const redirect = req.query.redirect || '/home';
    const state = Buffer.from(JSON.stringify({ redirect })).toString('base64');
    passport.authenticate('google-login', { scope: ['profile', 'email'], state })(
      req,
      res,
      next
    );
  });

  app.get('/auth/callback/google', (req, res) => {
    passport.authenticate('google-login', (err, user, info) => {
      const { state } = req.query;
      const { redirect } = JSON.parse(Buffer.from(state, 'base64').toString());
      if (typeof redirect !== 'string' || !redirect.startsWith('/'))
        return res.redirect('/');

      if (user) {
        if (err) return log('error', `Failed serializing ${user.email}`);
        log('info', `Successfully serialized ${user.email}`);

        const tokenString = `accessToken=${info['jwtAccessToken']}&refreshToken=${info['jwtRefreshToken']}`;
        if (user.work === undefined || user.work === null)
          return res.redirect(`/register/external?${tokenString}`);
        return res.redirect(`/login?redirect=${redirect}&${tokenString}`);
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
