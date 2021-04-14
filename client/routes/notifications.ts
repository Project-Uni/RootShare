import { Express } from 'express';
import { getQueryParams, getUserFromJWT, sendPacket } from '../helpers/functions';
import NotificationService from '../interactions/notification';
import { isAuthenticatedWithJWT } from '../passport/middleware/isAuthenticated';

export default function notificationRoutes(app: Express) {
  app.get('/api/notifications', isAuthenticatedWithJWT, async (req, res) => {
    const { _id: userID } = await getUserFromJWT(req);
    const notifications = await new NotificationService().getForUser({
      userID: userID.toString(),
    });

    if (!notifications)
      return res.status(400).json(sendPacket(0, 'Failed to retrieve notifications'));
    return res
      .status(200)
      .json(
        sendPacket(1, 'Successfully retrieved notifications', { notifications })
      );
  });

  app.put('/api/notifications/seen', isAuthenticatedWithJWT, async (req, res) => {
    const { _id: userID } = await getUserFromJWT(req);
    const query = getQueryParams<{ _ids: string[] }>(req, {
      _ids: { type: 'string[]' },
    });
    if (!query)
      return res.status(500).json(sendPacket(-1, 'Missing query params: _ids'));
    const { _ids } = query;

    new NotificationService().markAsSeen({
      _ids: _ids as string[],
      userID: userID.toString(),
    });

    res.status(200).json(sendPacket(1, 'Successfully marked notifications as read'));
  });
}