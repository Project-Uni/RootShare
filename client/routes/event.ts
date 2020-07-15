import sendPacket from '../helpers/sendPacket';
const isAuthenticated = require('../passport/middleware/isAuthenticated');

import {
  createEvent,
  getAllEvents,
  getWebinarDetails,
} from '../interactions/streaming/event';

import { USER_LEVEL } from '../types/types';

module.exports = (app) => {
  app.post('/api/webinar/createEvent', isAuthenticated, async (req, res) => {
    if (req.user.privilegeLevel < USER_LEVEL.admin)
      return res.json(
        sendPacket(0, 'User is not authorized to perform this action')
      );
    await createEvent(req.body, req.user, (packet) => res.json(packet));
  });

  app.get('/api/webinar/getAllEvents', isAuthenticated, async (req, res) => {
    if (req.user.privilegeLevel < USER_LEVEL.admin)
      return res.json(
        sendPacket(0, 'User is not authorized to perform this action')
      );
    await getAllEvents((packet) => res.json(packet));
  });

  app.get('/api/webinar/getDetails/:eventID', isAuthenticated, async (req, res) => {
    const { eventID } = req.params;
    await getWebinarDetails(eventID, (packet) => {
      res.json(packet);
    });
  });
};
