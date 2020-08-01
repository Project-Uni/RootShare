import sendPacket from '../helpers/sendPacket';
import { isAuthenticatedWithJWT } from '../passport/middleware/isAuthenticated';

import {
  createEvent,
  getAllEventsAdmin,
  getAllEventsUser,
  getWebinarDetails,
} from '../interactions/streaming/event';

import { USER_LEVEL } from '../types/types';

module.exports = (app) => {
  app.post('/api/webinar/createEvent', isAuthenticatedWithJWT, async (req, res) => {
    if (req.user.privilegeLevel < USER_LEVEL.ADMIN)
      return res.json(
        sendPacket(0, 'User is not authorized to perform this action')
      );
    await createEvent(req.body, req.user, (packet) => res.json(packet));
  });

  app.get('/api/webinar/getAllEvents', isAuthenticatedWithJWT, (req, res) => {
    if (req.user.privilegeLevel < USER_LEVEL.ADMIN)
      getAllEventsUser(req.user._id, (packet) => res.json(packet));
    else getAllEventsAdmin((packet) => res.json(packet));
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
};
