import { isAuthenticatedWithJWT, isRootshareAdmin } from '.';
import { getUserFromJWT } from '../../helpers/functions';
import {
  createEvent,
  deleteEvent,
  getAllEventsAdmin,
  sendEventEmailConfirmation,
} from '../../interactions/admin/event';

export default function adminEventRoutes(app) {
  app.post(
    '/api/webinar/createEvent',
    isAuthenticatedWithJWT,
    isRootshareAdmin,
    async (req, res) => {
      const user = getUserFromJWT(req);
      await createEvent(req.body, user, (packet) => res.json(packet));
    }
  );

  app.delete(
    '/api/webinar/event/:eventID',
    isAuthenticatedWithJWT,
    isRootshareAdmin,
    async (req, res) => {
      const { _id: userID } = getUserFromJWT(req);
      deleteEvent(userID, req.params.eventID, (packet) => res.json(packet));
    }
  );

  app.get(
    '/api/webinar/getAllEventsAdmin',
    isAuthenticatedWithJWT,
    isRootshareAdmin,
    (req, res) => {
      getAllEventsAdmin((packet) => res.json(packet));
    }
  );

  app.post(
    '/api/webinar/resendSpeakerInvites',
    isAuthenticatedWithJWT,
    isRootshareAdmin,
    (req, res) => {
      sendEventEmailConfirmation(
        req.body.webinarData,
        req.body.speakerEmails,
        (packet) => res.json(packet)
      );
    }
  );
}
