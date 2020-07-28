import sendPacket from '../helpers/sendPacket';
import { isAuthenticatedWithJWT } from '../passport/middleware/isAuthenticated';

import {
  createEvent,
  getAllEvents,
  getWebinarDetails,
} from '../interactions/streaming/event';

import { updateAttendingList } from '../interactions/user';

import { USER_LEVEL } from '../types/types';
import makeRequest from '../helpers/makeRequest';
import log from '../helpers/logger';
import User from '../models/users';

module.exports = (app) => {
  app.post('/api/webinar/createEvent', isAuthenticatedWithJWT, async (req, res) => {
    if (req.user.privilegeLevel < USER_LEVEL.ADMIN)
      return res.json(
        sendPacket(0, 'User is not authorized to perform this action')
      );
    await createEvent(req.body, req.user, (packet) => res.json(packet));
  });

  app.get('/api/webinar/getAllEvents', isAuthenticatedWithJWT, async (req, res) => {
    if (req.user.privilegeLevel < USER_LEVEL.ADMIN)
      return res.json(
        sendPacket(0, 'User is not authorized to perform this action')
      );
    await getAllEvents((packet) => res.json(packet));
  });

  app.get(
    '/api/webinar/getDetails/:eventID',
    isAuthenticatedWithJWT,
    async (req, res) => {
      const { eventID } = req.params;
      await getWebinarDetails(req.user._id, eventID, (packet) => {
        res.json(packet);
      });
    }
  );

  app.post(
    '/api/webinar/updateAttendeeList',
    isAuthenticatedWithJWT,
    async (req, res) => {
      const { webinarID } = req.body;
      if (!webinarID)
        return res.json(sendPacket(-1, 'Field webinarID not in request.'));
      await updateAttendingList(req.user._id, webinarID, (packet) =>
        res.json(packet)
      );
    }
  );

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
            })
          );
        }
      );
    }
  );
};
