import { getQueryParams, getUserFromJWT, sendPacket } from '../helpers/functions';
import { isAuthenticatedWithJWT } from '../passport/middleware/isAuthenticated';

import {
  createEvent,
  deleteEvent,
  getAllRecentEvents,
  getAllEventsAdmin,
  getAllEventsUser,
  getWebinarDetails,
  updateRSVP,
  addEventImage,
  addEventBanner,
  sendEventEmailConfirmation,
  getRecentEvents,
} from '../interactions/streaming/event';

import { updateAttendingList } from '../interactions/user';

import { USER_LEVEL } from '../helpers/types';

export default function eventRoutes(app) {
  app.post('/api/webinar/createEvent', isAuthenticatedWithJWT, async (req, res) => {
    const user = getUserFromJWT(req);
    if (user.privilegeLevel < USER_LEVEL.ADMIN)
      return res.json(
        sendPacket(0, 'User is not authorized to perform this action')
      );
    await createEvent(req.body, user, (packet) => res.json(packet));
  });

  app.delete(
    '/api/webinar/event/:eventID',
    isAuthenticatedWithJWT,
    async (req, res) => {
      const { privilegeLevel, _id: userID } = getUserFromJWT(req);
      if (privilegeLevel < USER_LEVEL.SUPER_ADMIN)
        return res.json(
          sendPacket(0, 'User is not authorized to perform this action')
        );

      deleteEvent(userID, req.params.eventID, (packet) => res.json(packet));
    }
  );

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
    const { _id: userID } = getUserFromJWT(req);
    getAllRecentEvents(userID, (packet) => res.json(packet));
  });

  app.get('/api/webinar/recent', isAuthenticatedWithJWT, async (req, res) => {
    const query = getQueryParams(req, { limit: { type: 'number', optional: true } });
    if (!query) res.status(500).json(sendPacket(-1, 'Invalid request'));
    else {
      const packet = await getRecentEvents((query.limit || 3) as number);
      const status = packet.success === 1 ? 200 : 500;
      res.status(status).json(packet);
    }
  });

  app.get('/api/webinar/getAllEventsAdmin', isAuthenticatedWithJWT, (req, res) => {
    const { privilegeLevel } = getUserFromJWT(req);
    if (privilegeLevel < USER_LEVEL.ADMIN)
      return res.json(
        sendPacket(0, 'User is not authorized to perform this action')
      );
    getAllEventsAdmin((packet) => res.json(packet));
  });

  app.get('/api/webinar/getAllEventsUser', isAuthenticatedWithJWT, (req, res) => {
    const { _id: userID } = getUserFromJWT(req);
    getAllEventsUser(userID, (packet) => res.json(packet));
  });

  app.post(
    '/api/webinar/resendSpeakerInvites',
    isAuthenticatedWithJWT,
    (req, res) => {
      const { privilegeLevel } = getUserFromJWT(req);
      if (privilegeLevel < USER_LEVEL.ADMIN)
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
      const { _id: userID } = getUserFromJWT(req);
      await getWebinarDetails(userID, eventID, (packet) => {
        res.json(packet);
      });
    }
  );

  app.post('/api/webinar/updateRSVP', isAuthenticatedWithJWT, (req, res) => {
    const { _id: userID } = getUserFromJWT(req);
    updateRSVP(userID, req.body.webinarID, req.body.didRSVP, (packet) => {
      res.json(packet);
    });
  });

  app.post(
    '/api/webinar/updateAttendeeList',
    isAuthenticatedWithJWT,
    async (req, res) => {
      const { webinarID } = req.body;
      const { _id: userID } = getUserFromJWT(req);
      if (!webinarID)
        return res.json(sendPacket(-1, 'Field webinarID not in request.'));
      await updateAttendingList(userID, webinarID, (packet) => res.json(packet));
    }
  );
}
