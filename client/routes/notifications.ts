import { Express } from 'express';
import { getQueryParams, getUserFromJWT, sendPacket } from '../helpers/functions';
import NotificationService from '../interactions/notification';
import { isAuthenticatedWithJWT } from '../passport/middleware/isAuthenticated';
import { isRootshareAdmin } from './middleware/privilegeAuthentication';

export default function notificationRoutes(app: Express) {
  app.get('/api/notifications', isAuthenticatedWithJWT, async (req, res) => {
    const { _id: userID } = getUserFromJWT(req);
    const notifications = await new NotificationService().getForUser({ userID });

    if (!notifications)
      return res.status(400).json(sendPacket(0, 'Failed to retrieve notifications'));
    return res
      .status(200)
      .json(
        sendPacket(1, 'Successfully retrieved notifications', { notifications })
      );
  });

  app.put('/api/notifications/seen', isAuthenticatedWithJWT, async (req, res) => {
    const { _id: userID } = getUserFromJWT(req);
    const query = getQueryParams(req, { _ids: { type: 'string[]' } });
    if (!query)
      return res.status(500).json(sendPacket(-1, 'Missing query params: _ids'));
    const { _ids } = query;

    new NotificationService().markAsSeen({
      _ids: _ids as string[],
      userID,
    });

    res.status(200).json(sendPacket(1, 'Successfully marked notifications as read'));
  });

  app.post(
    '/api/notifications/promoteEvent',
    isAuthenticatedWithJWT,
    isRootshareAdmin,
    async (req, res) => {
      const { _id: userID } = getUserFromJWT(req);
      const { eventID, message } = req.body;
      if (!eventID || !message)
        res
          .status(500)
          .json(sendPacket(-1, 'Missing body params: eventID, message'));
      else {
        const packet = await new NotificationService().promoteEvent({
          eventID,
          message,
          createdByAdmin: userID,
        });
        const status = packet.success === 1 ? 200 : 500;
        res.status(status).json(packet);
      }
    }
  );
}
