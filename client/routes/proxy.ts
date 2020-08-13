import makeRequest from '../helpers/makeRequest';
import log from '../helpers/logger';
import { isAuthenticatedWithJWT } from '../passport/middleware/isAuthenticated';
import sendPacket from '../../webinar/helpers/sendPacket';
import { isEventHost } from './middleware/eventAuthentication';

module.exports = (app) => {
  app.post(
    '/proxy/addWebinarToCache',
    isAuthenticatedWithJWT,
    isEventHost,
    async (req, res) => {
      const { webinarID } = req.body;
      if (!webinarID)
        return res.json(sendPacket(-1, 'No webinarID in request body'));

      const authHeader = req.headers['authorization'];
      const accessToken = authHeader && authHeader.split(' ')[1];

      const data = await makeRequest(
        'webinarCache',
        'api/addWebinarToCache',
        'POST',
        {
          webinarID,
        },
        true,
        accessToken,
        '',
        req.user
      );

      return res.json(data);
    }
  );

  app.post(
    '/proxy/removeWebinarFromCache',
    isAuthenticatedWithJWT,
    isEventHost,
    async (req, res) => {
      const { webinarID } = req.body;
      if (!webinarID)
        return res.json(sendPacket(-1, 'No webinarID in request body'));

      const authHeader = req.headers['authorization'];
      const accessToken = authHeader && authHeader.split(' ')[1];

      const data = await makeRequest(
        'webinarCache',
        'api/removeWebinarFromCache',
        'POST',
        {
          webinarID,
        },
        true,
        accessToken,
        '',
        req.user
      );

      return res.json(data);
    }
  );

  app.post(
    '/proxy/webinar/inviteUserToSpeak',
    isAuthenticatedWithJWT,
    isEventHost,
    async (req, res) => {
      const { webinarID, userID, sessionID } = req.body;
      if (!webinarID || !userID || !sessionID)
        return res.json(
          sendPacket(
            -1,
            'userID or webinarID or sessionID missing from request body'
          )
        );

      const authHeader = req.headers['authorization'];
      const accessToken = authHeader && authHeader.split(' ')[1];

      const data = await makeRequest(
        'webinarCache',
        'api/inviteUserToSpeak',
        'POST',
        { webinarID, userID, sessionID },
        true,
        accessToken,
        '',
        req.user
      );

      if (data['success'] !== 1) log('error', 'Failed to invite user to stream');
      else log('info', 'Successfully invited user to stream');

      return res.json(data);
    }
  );

  app.post(
    '/proxy/webinar/removeGuestSpeaker',
    isAuthenticatedWithJWT,
    isEventHost,
    async (req, res) => {
      const { webinarID } = req.body;
      if (!webinarID)
        return res.json(sendPacket(-1, 'webinarID missing from request body'));

      const authHeader = req.headers['authorization'];
      const accessToken = authHeader && authHeader.split(' ')[1];

      const data = await makeRequest(
        'webinarCache',
        'api/removeGuestSpeaker',
        'POST',
        { webinarID },
        true,
        accessToken,
        '',
        req.user
      );

      if (data['success'] !== 1) log('error', 'Failed to remove user from stream');
      else log('info', 'Successfully removed user from stream');

      return res.json(data);
    }
  );

  app.post(
    '/proxy/webinar/setConnectionID',
    isAuthenticatedWithJWT,
    async (req, res) => {
      const { webinarID, connection, speaking_token } = req.body;

      const authHeader = req.headers['authorization'];
      const accessToken = authHeader && authHeader.split(' ')[1];

      if (!webinarID || !connection || !speaking_token)
        return res.json(
          sendPacket(
            -1,
            'webinarID, connection, or speaking_token missing from request body'
          )
        );

      const data = await makeRequest(
        'webinarCache',
        'api/setConnectionID',
        'POST',
        {
          webinarID,
          connection,
          speaking_token,
        },
        true,
        accessToken,
        '',
        req.user
      );

      if (data.success !== 1) log('error', data.message);
      else log('info', 'Successfully set connection for guest speaker');
      return res.json(data);
    }
  );
};
