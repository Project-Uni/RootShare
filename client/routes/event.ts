import { log, makeRequest, sendPacket } from '../helpers/functions';
import { isAuthenticatedWithJWT } from '../passport/middleware/isAuthenticated';

import {
  createEvent,
  getAllRecentEvents,
  getAllEventsAdmin,
  getAllEventsUser,
  getWebinarDetails,
  updateRSVP,
  addEventImage,
  addEventBanner,
  sendEventEmailConfirmation,
} from '../interactions/streaming/event';

import { updateAttendingList } from '../interactions/user';

import { USER_LEVEL } from '../helpers/types';
import User from '../models/users';

module.exports = (app) => {
  app.post('/api/webinar/createEvent', isAuthenticatedWithJWT, async (req, res) => {
    if (req.user.privilegeLevel < USER_LEVEL.ADMIN)
      return res.json(
        sendPacket(0, 'User is not authorized to perform this action')
      );
    await createEvent(req.body, req.user, (packet) => res.json(packet));
  });

  app.post(
    '/api/webinar/uploadEventImage',
    isAuthenticatedWithJWT,
    async (req, res) => {
      res.json(await addEventImage(req.body.eventID, req.body.eventImage));
    }
  );

  app.post(
    '/api/webinar/uploadEventBanner',
    isAuthenticatedWithJWT,
    async (req, res) => {
      res.json(await addEventBanner(req.body.eventID, req.body.eventBanner));
    }
  );

  app.get('/api/webinar/recents', isAuthenticatedWithJWT, (req, res) => {
    getAllRecentEvents(req.user._id, (packet) => res.json(packet));
  });

  app.get('/api/webinar/getAllEventsAdmin', isAuthenticatedWithJWT, (req, res) => {
    if (req.user.privilegeLevel < USER_LEVEL.ADMIN)
      return res.json(
        sendPacket(0, 'User is not authorized to perform this action')
      );
    getAllEventsAdmin((packet) => res.json(packet));
  });

  app.get('/api/webinar/getAllEventsUser', isAuthenticatedWithJWT, (req, res) => {
    getAllEventsUser(req.user._id, (packet) => res.json(packet));
  });

  app.post(
    '/api/webinar/resendSpeakerInvites',
    isAuthenticatedWithJWT,
    (req, res) => {
      if (req.user.privilegeLevel < USER_LEVEL.ADMIN)
        return res.json(
          sendPacket(0, 'User is not authorized to perform this action')
        );

      sendEventEmailConfirmation(
        req.body.webinarData,
        req.body.speakerEmails,
        (packet) => res.json(packet)
      );
    }
  );

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

  app.post('/api/webinar/updateRSVP', isAuthenticatedWithJWT, (req, res) => {
    updateRSVP(req.user._id, req.body.webinarID, req.body.didRSVP, (packet) => {
      res.json(packet);
    });
  });

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
};
