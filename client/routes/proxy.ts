import makeRequest from '../helpers/makeRequest';
import log from '../helpers/logger';
import { isAuthenticatedWithJWT } from '../passport/middleware/isAuthenticated';
import sendPacket from '../../webinar/helpers/sendPacket';

module.exports = (app) => {
  app.post('/proxy/addWebinarToCache', isAuthenticatedWithJWT, async (req, res) => {
    const { webinarID } = req.body;
    if (!webinarID) return res.json(sendPacket(-1, 'No webinarID in request body'));

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
  });

  app.post(
    '/proxy/removeWebinarFromCache',
    isAuthenticatedWithJWT,
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
    async (req, res) => {
      const { webinarID, userID } = req.body;
      if (!webinarID || !userID)
        return res.json(
          sendPacket(-1, 'userID or webinarID missing from request body')
        );

      //TODO - Check to see if user is host of event
      //Will implement this using function smit Wrote in un-merged PR

      const authHeader = req.headers['authorization'];
      const accessToken = authHeader && authHeader.split(' ')[1];

      const data = await makeRequest(
        'webinarCache',
        'api/inviteUserToSpeak',
        'POST',
        { webinarID, userID },
        true,
        accessToken,
        '',
        req.user
      );

      if (data['success'] !== 1) log('error', 'Failed to invite user to stream');

      return res.json(data);
    }
  );

  app.post(
    '/proxy/webinar/removeGuestSpeaker',
    isAuthenticatedWithJWT,
    async (req, res) => {
      const { webinarID } = req.body;
      if (!webinarID)
        return res.json(sendPacket(-1, 'webinarID missing from request body'));

      const authHeader = req.headers['authorization'];
      const accessToken = authHeader && authHeader.split(' ')[1];

      //TODO - Check to see if user is host of event
      //Will implement this using function smit Wrote in un-merged PR

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

      if (data['success'] !== 1) log('error', 'Failed to invite user to stream');

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
      return res.json(data);
    }
  );
};
