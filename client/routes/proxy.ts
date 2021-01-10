import { log, makeRequest } from '../helpers/functions';
import { isAuthenticatedWithJWT } from '../passport/middleware/isAuthenticated';
import sendPacket from '../../webinar/helpers/sendPacket';
import { isEventHost } from './middleware/eventAuthentication';
import { User } from '../models';

module.exports = (app) => {
  app.get(
    '/api/webinar/:webinarID/getActiveViewers',
    isAuthenticatedWithJWT,
    async (req, res) => {
      const { webinarID } = req.params;
      const authHeader = req.headers['authorization'];
      const accessToken = authHeader && authHeader.split(' ')[1];

      const data = await makeRequest(
        'webinarCache',
        `api/webinar/${webinarID}/getActiveViewers`,
        'GET',
        {},
        true,
        accessToken,
        '',
        req.user
      );

      if (data['success'] !== 1) {
        return res.json(data);
      }

      User.find(
        { _id: { $in: data['content']['activeUserIDs'] } },
        ['_id', 'firstName', 'lastName', 'email'],
        (err, users) => {
          if (err) {
            log('error', err);
            return res.json(
              sendPacket(-1, 'There was an error retrieving active users')
            );
          }
          return res.json(
            sendPacket(1, 'Successfully retrieved all active users', {
              users: users,
              currentSpeakers: data['content']['currentSpeakers'],
            })
          );
        }
      );
    }
  );

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
      const { webinarID, speakingToken } = req.body;
      if (!webinarID)
        return res.json(sendPacket(-1, 'webinarID missing from request body'));

      const authHeader = req.headers['authorization'];
      const accessToken = authHeader && authHeader.split(' ')[1];

      const data = await makeRequest(
        'webinarCache',
        'api/removeGuestSpeaker',
        'POST',
        { webinarID, speakingToken },
        true,
        accessToken,
        '',
        req.user
      );

      if (data['success'] !== 1) log('error', 'Failed to remove user from stream');
      else log('info', 'Successfully removed user from stream');

      console.log(data);
      return res.json(data);
    }
  );

  app.post(
    '/proxy/webinar/setConnectionID',
    isAuthenticatedWithJWT,
    async (req, res) => {
      const { webinarID, connection, speakingToken } = req.body;

      const authHeader = req.headers['authorization'];
      const accessToken = authHeader && authHeader.split(' ')[1];

      if (!webinarID || !connection || !speakingToken)
        return res.json(
          sendPacket(
            -1,
            'webinarID, connection, or speakingToken missing from request body'
          )
        );

      const data = await makeRequest(
        'webinarCache',
        'api/setConnectionID',
        'POST',
        {
          webinarID,
          connection,
          speakingToken,
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

  app.post(
    '/proxy/webinar/removeViewerFromStream',
    isAuthenticatedWithJWT,
    isEventHost,
    async (req, res) => {
      const { userID, webinarID } = req.body;
      if (!userID || !webinarID)
        return res.json(sendPacket(-1, 'userID or webinarID not in request body'));

      const authHeader = req.headers['authorization'];
      const accessToken = authHeader && authHeader.split(' ')[1];

      const data = await makeRequest(
        'webinarCache',
        'api/removeViewerFromStream',
        'POST',
        {
          userID,
          webinarID,
        },
        true,
        accessToken,
        '',
        req.user
      );

      //NOTE: -1 means invalid webinarID, 0 means could not find user (user left stream already), 1 means successfully removed user
      if (data.success !== 1) log('error', data.message);
      else log('info', `Successfully removed user ${userID} from ${webinarID}`);

      //TODO - If data.success === 0 | 1 : Add user to list of blocked users and prevent them from re-entering the event
      return res.json(data);
    }
  );
};
