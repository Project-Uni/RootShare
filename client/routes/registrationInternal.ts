var passport = require('passport');

import { isAuthenticatedWithJWT } from '../passport/middleware/isAuthenticated';
import {
  log,
  sendPacket,
  generateJWT,
  retrieveSignedUrl,
  getUserFromJWT,
} from '../helpers/functions';
import { User } from '../models';
var {
  confirmUser,
  unsubscribeUser,
  sendConfirmationEmail,
} = require('../interactions/registration/email-confirmation');
var {
  sendPasswordResetLink,
  updatePassword,
} = require('../interactions/registration/reset-password');
var {
  completeRegistrationDetails,
  completeRegistrationRequired,
} = require('../interactions/registration/registration-data');

export default function registrationInternalRoutes(app) {
  app.post('/auth/signup/local', (req, res) => {
    passport.authenticate('local-signup', (err, user, info) => {
      if (user) {
        return res.json(
          sendPacket(1, 'Successfully signed up', {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            _id: user._id,
            privilegeLevel: 1,
            accountType: user.accountType,
            accessToken: info['jwtAccessToken'],
            refreshToken: info['jwtRefreshToken'],
          })
        );
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
    let check = await User.exists({ email: email.toLowerCase() });
    if (check) {
      res.json(sendPacket(0, 'User with this email already exists'));
      log('error', `User tried creating a duplicate account with ${email}`);
    } else {
      res.json(sendPacket(1, 'New User'));
      log('info', `There is not yet an account for ${email}`);
    }
  });

  app.post(
    '/auth/complete-registration/required',
    isAuthenticatedWithJWT,
    async (req, res) => {
      const { email } = getUserFromJWT(req);
      const result = await completeRegistrationRequired(req.body, email);

      if (result['success'] === 1) {
        log('info', `Completed required registration for ${email}`);
      }
      return res.json(result);
    }
  );

  app.post(
    '/auth/complete-registration/details',
    isAuthenticatedWithJWT,
    async (req, res) => {
      const { email } = getUserFromJWT(req);
      const result = await completeRegistrationDetails(req.body, email);

      if (result['success'] === 1) {
        log('info', `Completed registration details for ${email}`);
      }
      return res.json(result);
    }
  );

  app.post('/auth/getRegistrationInfo', isAuthenticatedWithJWT, async (req, res) => {
    const user = getUserFromJWT(req);

    let check = await User.exists({ email: user.email.toLowerCase() });

    if (check) {
      try {
        const userDB = await User.findOne(
          { _id: user._id },
          'work accountType'
        ).exec();
        res.json(
          sendPacket(1, 'Sending back current user', {
            email: user.email,
            regComplete: userDB.work !== undefined,
            externalComplete: Boolean(userDB.accountType),
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id,
          })
        );
        log('info', `Sent ${user.email} to frontend`);
      } catch (err) {
        res.json(sendPacket(0, 'Invalid user'));
      }
    } else {
      res.json(sendPacket(0, 'There is no user currently logged in'));
      log('error', `There is no user currently logged in`);
    }
  });

  app.get('/auth/confirmation/:token', async (req, res) => {
    let user = await confirmUser(req.params.token);

    if (user) {
      const JWT = generateJWT(user);
      return res.redirect(
        `/register/external?accessToken=${JWT.accessToken}&refreshToken=${JWT.refreshToken}`
      );
    } else {
      res.json(sendPacket(-1, 'There was an error processing your request'));
      log('error', `Was not able to confirm user`);
    }
  });

  app.get('/auth/unsubscribe/:token', async (req, res) => {
    let user = await unsubscribeUser(req.params.token);

    if (user) {
      res.json(sendPacket(1, `Successfully Unsubscribed user: ${user.email}`));
      log('info', `Unsubscribed user: ${user.email}`);
    } else {
      res.json(sendPacket(-1, 'There was an error processing your request'));
      log('error', `Was not able to unsubscribe user, please try again`);
    }
  });

  app.get('/auth/confirmation-resend', isAuthenticatedWithJWT, (req, res) => {
    const { email } = getUserFromJWT(req);
    if (email) {
      sendConfirmationEmail(email);
      res.json(sendPacket(1, 'Confirmation email has been resent'));
      log('info', `Resent a confirmation email to ${email}`);
    } else {
      res.json(sendPacket(-1, 'There was an error processing your request'));
      log('error', `Resend confirmation email for ${email}`);
    }
  });

  app.get('/auth/secure-unconfirmed', isAuthenticatedWithJWT, (req, res) => {
    res.json(
      sendPacket(
        1,
        'Successfully accessed secure endpoint! User needs to confirm account'
      )
    );
    log('info', `User accessed secure-unconfirmed endpoint`);
  });

  app.post('/auth/sendPasswordReset', (req, res) => {
    if (!req.body.email) return res.json(sendPacket(-1, 'No email to send link to'));

    sendPasswordResetLink(req.body.email.toLowerCase(), (packet) => {
      res.json(packet);
    });
  });

  app.post('/auth/updatePassword', (req, res) => {
    updatePassword(req.body.emailToken, req.body.newPassword, (packet) => {
      res.json(packet);
    });
  });

  app.post('/auth/logout', (req, res) => {
    // const { email } = getUserFromJWT(req);
    //TODO - Invalidate Access and Refresh tokens
    res.json(sendPacket(1, 'Successfully logged out'));
  });
}
