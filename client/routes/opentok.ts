import sendPacket from '../helpers/sendPacket';
import { USER_LEVEL } from '../types/types';
import { isAuthenticatedWithJWT } from '../passport/middleware/isAuthenticated';

const {
  getOpenTokSessionID,
  getOpenTokToken,
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
};
