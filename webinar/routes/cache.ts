import { Server } from 'socket.io';
import { Express } from 'express';

import log from '../helpers/logger';
import sendPacket from '../helpers/sendPacket';
import { isAuthenticatedWithJWT } from '../middleware/isAuthenticated';
import { broadcastEventStart } from '../interactions/socket';

import { WebinarCache, WaitingRooms } from '../types/types';

module.exports = (
  app: Express,
  io: Server,
  webinarCache: WebinarCache,
  waitingRooms: WaitingRooms
) => {
  app.post('/api/addWebinarToCache', isAuthenticatedWithJWT, (req, res) => {
    const { webinarID } = req.body;
    if (!webinarID)
      return res.json(sendPacket(-1, 'webinarID or hostID not in request'));

    if (webinarID in webinarCache) {
      log('info', `Webinar ${webinarID} already initialized in cache`);
      return res.json(sendPacket(0, 'Webinar already initialized in cache'));
    }

    const startTime = Date.now();
    webinarCache[webinarID] = {
      users: {},
      host: waitingRooms[webinarID].host,
      startTime,
      speakingTokens: [],
      guestSpeakers: [],
    };

    log('info', `Added webinar ${webinarID} to cache`);
    log('info', `Active Webinars: ${Object.keys(webinarCache)}`);

    setTimeout(() => {
      broadcastEventStart(io, webinarID, waitingRooms, webinarCache);
    }, 1000 * 25);

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

      const currWebinar = webinarCache[webinarID];
      const activeUserIDs = Object.keys(currWebinar.users);

      return res.json(
        sendPacket(1, 'Successfully fetched active users', {
          activeUserIDs,
          currentSpeakers: currWebinar.guestSpeakers,
        })
      );
    }
  );

  app.get('/api/webinar/cache', (req, res) => {
    return res.json({ cache: webinarCache, waitingRooms: waitingRooms });
  });
};
