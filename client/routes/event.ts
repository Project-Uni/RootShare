import { ObjectIdVal } from '../rootshare_db/types';
import {
  getQueryParams,
  getUserFromJWT,
  sendPacket,
  log,
} from '../helpers/functions';
import { isAuthenticatedWithJWT } from '../passport/middleware/isAuthenticated';
import {
  getAllRecentEvents,
  getAllEventsUser,
  getWebinarDetails,
  updateRSVP,
  addEventImage,
  addEventBanner,
  getRecentEvents,
  getExternalEventInfo,
} from '../interactions/streaming/event';
import { updateAttendingList } from '../interactions/user';

export default function eventRoutes(app) {
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
    const query = getQueryParams<{ limit: boolean }>(req, {
      limit: { type: 'number', optional: true },
    });
    if (!query) res.status(500).json(sendPacket(-1, 'Invalid request'));
    else {
      const packet = await getRecentEvents((query.limit || 3) as number);
      const status = packet.success === 1 ? 200 : 500;
      res.status(status).json(packet);
    }
  });

  app.get('/api/webinar/getAllEventsUser', isAuthenticatedWithJWT, (req, res) => {
    const { _id: userID } = getUserFromJWT(req);
    getAllEventsUser(userID, (packet) => res.json(packet));
  });

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

  app.get('/api/event/external', async (req, res) => {
    try {
      const query = getQueryParams<{
        eventID: string;
        userID?: string;
      }>(req, {
        eventID: { type: 'string' },
        userID: { type: 'string', optional: true },
      });
      if (!query)
        return res.status(500).json(sendPacket(-1, 'Invalid query params'));
      const { eventID, userID } = query;
      const packet = await getExternalEventInfo(
        ObjectIdVal(eventID),
        userID && ObjectIdVal(userID)
      );
      res.status(packet.status).json(packet);
    } catch (err) {
      log('err', err);
      res.status(500).json(sendPacket(-1, err.message));
    }
  });
}
