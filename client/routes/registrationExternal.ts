var passport = require('passport');

import sendPacket from '../helpers/sendPacket';
import log from '../helpers/logger';

module.exports = (app) => {
  app.get(
    '/auth/login/linkedin',
    passport.authenticate('linkedin-login'),
    (req, res) => {
      // This will not get called because of routing to LinkedIn
    }
  );

  app.get('/auth/callback/linkedin', (req, res) => {
    passport.authenticate('linkedin-login', (err, user, info) => {
      if (user) {
        req.login(user, (err) => {
          if (err) {
            log('error', `Failed serializing ${user.email}`);
          }
          log('info', `Successfully serialized ${user.email}`);

          if (user.university === undefined) {
            return res.redirect(
              `/register/external/${info['jwtAccessToken']}/${info['jwtRefreshToken']}`
            );
          } else {
            return res.redirect(
              `/register/initialize/${info['jwtAccessToken']}/${info['jwtRefreshToken']}`
            );
          }
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
};
