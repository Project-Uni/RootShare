import { isAuthenticatedWithJWT } from '../passport/middleware/isAuthenticated';
import { isEventSpeaker } from './middleware/isEventSpeaker';
import { isEventHost } from './middleware/isEventHost';

const {
  getOpenTokSessionID,
  getOpenTokToken,
  startStreaming,
  stopStreaming,
  changeBroadcastLayout,
} = require('../interactions/streaming/opentok');

module.exports = (app) => {
  app.post(
    '/webinar/getOpenTokSessionID',
    isAuthenticatedWithJWT,
    isEventSpeaker,
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

  app.post(
    '/webinar/startStreaming',
    isAuthenticatedWithJWT,
    isEventHost,
    async (req, res) => {
      const { webinarID } = req.body;
      const packet = await startStreaming(webinarID);
      res.json(packet);
    }
  );

  app.post(
    '/webinar/stopStreaming',
    isAuthenticatedWithJWT,
    isEventHost,
    async (req, res) => {
      const { webinarID } = req.body;
      const packet = await stopStreaming(webinarID);
      res.json(packet);
    }
  );

  app.post(
    '/webinar/changeBroadcastLayout',
    isAuthenticatedWithJWT,
    isEventSpeaker,
    async (req, res) => {
      const { webinarID, type, streamID } = req.body;
      await changeBroadcastLayout(webinarID, type, streamID, (packet) => {
        res.json(packet);
      });
    }
  );
};
