import sendPacket from '../helpers/sendPacket';
import log from '../helpers/logger';
const isAuthenticated = require('../passport/middleware/isAuthenticated');
const {
  createSession,
  getOpenTokSessionID,
  getOpenTokToken,
  getMuxPlaybackID,
  startStreaming,
  stopStreaming,
  getLatestWebinarID,
  changeBroadcastLayout,
} = require('../interactions/streaming/opentok');

module.exports = (app) => {
  app.get('/webinar/createSession', isAuthenticated, async (req, res) => {
    const { id } = req.user;
    const packet = await createSession(id);
    res.json(packet);
  });

  app.get('/webinar/latestWebinarID', isAuthenticated, async (req, res) => {
    const { id } = req.user;
    const packet = await getLatestWebinarID(id);
    res.json(packet);
  });

  app.post('/webinar/getOpenTokSessionID', isAuthenticated, async (req, res) => {
    const { webinarID } = req.body;
    const packet = await getOpenTokSessionID(webinarID);
    res.json(packet);
  });

  app.post('/webinar/getOpenTokToken', isAuthenticated, async (req, res) => {
    const { opentokSessionID } = req.body;
    const packet = await getOpenTokToken(opentokSessionID);
    res.json(packet);
  });

  app.post('/webinar/getMuxPlaybackID', isAuthenticated, async (req, res) => {
    const { webinarID } = req.body;
    const packet = await getMuxPlaybackID(webinarID);
    res.json(packet);
  });

  app.post('/webinar/startStreaming', isAuthenticated, async (req, res) => {
    const { webinarID } = req.body;
    const packet = await startStreaming(webinarID);
    res.json(packet);
  });

  app.post('/webinar/stopStreaming', isAuthenticated, async (req, res) => {
    const { webinarID } = req.body;
    const packet = await stopStreaming(webinarID);
    res.json(packet);
  });

  app.post('/webinar/changeBroadcastLayout', isAuthenticated, async (req, res) => {
    const { webinarID, type, streamID } = req.body;
    await changeBroadcastLayout(webinarID, type, streamID, (packet) => {
      res.json(packet);
    });
  });
};
