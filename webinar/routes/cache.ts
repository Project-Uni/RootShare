import { Server } from 'socket.io';

import log from '../helpers/logger';
import sendPacket from '../helpers/sendPacket';
import { isAuthenticatedWithJWT } from '../middleware/isAuthenticated';
import { broadcastEventStart } from '../interactions/socket';

import { WebinarCache } from '../types/types';

module.exports = (app, webinarCache: WebinarCache, io: Server) => {
  app.post('/api/addWebinarToCache', isAuthenticatedWithJWT, (req, res) => {
    const { webinarID } = req.body;
    if (!webinarID) return res.json(sendPacket(-1, 'webinarID not in request'));

    if (webinarID in webinarCache) {
      log('info', `Webinar ${webinarID} already initialized in cache`);
      return res.json(sendPacket(0, 'Webinar already initialized in cache'));
    }

    const startTime = Date.now();
    webinarCache[webinarID] = { users: {}, startTime };

    log('info', `Added webinar ${webinarID} to cache`);
    log('info', `Active Webinars: ${Object.keys(webinarCache)}`);

    setTimeout(() => {
      broadcastEventStart(io, webinarID);
    }, 1000 * 45);

    return res.json(sendPacket(1, 'Successfully initialized webinar in cache'));
  });

  app.post('/api/removeWebinarFromCache', isAuthenticatedWithJWT, (req, res) => {
    const { webinarID } = req.body;

    if (!webinarID) return res.json(sendPacket(-1, 'webinarID not in request'));
    if (!(webinarID in webinarCache)) {
      log('info', `Webinar ${webinarID} not in cache`);
      return res.json(sendPacket(0, 'Webinar not found in cache'));
    }

    delete webinarCache[webinarID];

    log('info', `Webinars: ${Object.keys(webinarCache)}`);
    return res.json(sendPacket(1, 'Successfully removed webinar in cache'));
  });

  app.get(
    '/api/webinar/:webinarID/getActiveViewers',
    isAuthenticatedWithJWT,
    (req, res) => {
      const { webinarID } = req.params;
      if (!webinarID) return res.json(sendPacket(-1, 'webinarID not in request'));
      if (!(webinarID in webinarCache))
        return res.json(sendPacket(0, 'Webinar not found in cache'));

      const activeUserIDs = Object.keys(webinarCache[webinarID].users);

      let currentSpeaker: { [key: string]: any };
      if (webinarCache[webinarID].guestSpeaker) {
        const currentSpeakerID = webinarCache[webinarID].guestSpeaker._id;
        if (webinarCache[webinarID].users[currentSpeakerID]) {
          currentSpeaker = webinarCache[webinarID].guestSpeaker;
        }
      }

      return res.json(
        sendPacket(1, 'Successfully fetched active users', {
          activeUserIDs,
          currentSpeaker: currentSpeaker || null,
        })
      );
    }
  );
};
