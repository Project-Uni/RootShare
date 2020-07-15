const mongoose = require('mongoose');
const Webinar = mongoose.model('webinars');

import sendPacket from '../helpers/sendPacket';
import log from '../helpers/logger';
import { USER_LEVEL } from '../types/types';
import { isAuthenticated } from '../passport/middleware/isAuthenticated';

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

import { createEvent, getWebinarDetails } from '../interactions/streaming/event';

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

  app.post('/api/webinar/createEvent', isAuthenticated, async (req, res) => {
    if (req.user.privilegeLevel < USER_LEVEL.ADMIN)
      return res.json(
        sendPacket(0, 'User is not authorized to perform this action')
      );
    await createEvent(req.body, req.user, (packet) => res.json(packet));
  });

  app.get('/api/webinar/getDetails/:eventID', isAuthenticated, async (req, res) => {
    const { eventID } = req.params;
    await getWebinarDetails(eventID, (packet) => {
      res.json(packet);
    });
  });
};
