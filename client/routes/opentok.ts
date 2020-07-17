const mongoose = require('mongoose');
const Webinar = mongoose.model('webinars');

import sendPacket from '../helpers/sendPacket';
import log from '../helpers/logger';
import { USER_LEVEL } from '../types/types';
import {
  isAuthenticated,
  isAuthenticatedWithJWT,
} from '../passport/middleware/isAuthenticated';

const {
  getOpenTokSessionID,
  getOpenTokToken,
  getMuxPlaybackID,
  startStreaming,
  stopStreaming,
  changeBroadcastLayout,
} = require('../interactions/streaming/opentok');

import { createEvent, getWebinarDetails } from '../interactions/streaming/event';

module.exports = (app) => {
  app.post(
    '/webinar/getOpenTokSessionID',
    isAuthenticatedWithJWT,
    async (req, res) => {
      const { webinarID } = req.body;
      const packet = await getOpenTokSessionID(webinarID);
      res.json(packet);
    }
  );

  app.post('/webinar/getOpenTokToken', isAuthenticatedWithJWT, async (req, res) => {
    const { opentokSessionID } = req.body;
    const packet = await getOpenTokToken(opentokSessionID);
    res.json(packet);
  });

  app.post('/webinar/startStreaming', isAuthenticatedWithJWT, async (req, res) => {
    const { webinarID } = req.body;
    const packet = await startStreaming(webinarID);
    res.json(packet);
  });

  app.post('/webinar/stopStreaming', isAuthenticatedWithJWT, async (req, res) => {
    const { webinarID } = req.body;
    const packet = await stopStreaming(webinarID);
    res.json(packet);
  });

  app.post(
    '/webinar/changeBroadcastLayout',
    isAuthenticatedWithJWT,
    async (req, res) => {
      const { webinarID, type, streamID } = req.body;
      await changeBroadcastLayout(webinarID, type, streamID, (packet) => {
        res.json(packet);
      });
    }
  );

  app.post('/api/webinar/createEvent', isAuthenticatedWithJWT, async (req, res) => {
    if (req.user.privilegeLevel < USER_LEVEL.ADMIN)
      return res.json(
        sendPacket(0, 'User is not authorized to perform this action')
      );
    await createEvent(req.body, req.user, (packet) => res.json(packet));
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
