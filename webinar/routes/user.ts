const crypto = require('crypto');

import log from '../helpers/logger';
import sendPacket from '../helpers/sendPacket';
import { isAuthenticatedWithJWT } from '../middleware/isAuthenticated';
import { WebinarCache, WaitingRooms } from '../types/types';

module.exports = (app, webinarCache: WebinarCache, waitingRooms: WaitingRooms) => {
  app.post('/api/inviteUserToSpeak', isAuthenticatedWithJWT, (req, res) => {
    const { webinarID, userID, sessionID } = req.body;
    if (!webinarID || !userID || !sessionID)
      return res.json(
        sendPacket(-1, 'userID or webinarID or sessionID missing from request body')
      );

    if (!(webinarID in webinarCache))
      return res.json(sendPacket(0, 'Webinar not in cache'));

    if (!(userID in webinarCache[webinarID].users))
      return res.json(sendPacket(0, 'User not found in webinar cache'));

    const socket = webinarCache[webinarID].users[userID];

    const speaking_token = crypto.randomBytes(64).toString();
    webinarCache[webinarID].speakingToken = speaking_token;

    socket.emit('speaking-invite', { speaking_token, sessionID });
    return res.json(sendPacket(1, 'Successfully invited user to speak'));
  });

  app.post('/api/removeGuestSpeaker', isAuthenticatedWithJWT, (req, res) => {
    const { webinarID } = req.body;
    if (!webinarID)
      return res.json(sendPacket(-1, 'webinarID missing from request body'));

    if (!(webinarID in webinarCache))
      return res.json(sendPacket(0, 'Webinar not in cache'));

    const speakerID = webinarCache[webinarID].guestSpeaker._id;

    if (!webinarCache[webinarID].guestSpeaker.connection?.connectionId) {
      return res.json(sendPacket(0, 'Still waiting for connection to initialize'));
    }

    delete webinarCache[webinarID].guestSpeaker;
    delete webinarCache[webinarID].speakingToken;

    if (!(speakerID in webinarCache[webinarID].users))
      return res.json(sendPacket(1, 'User already left the stream'));

    const socket = webinarCache[webinarID].users[speakerID];
    socket.emit('speaking-revoke');

    return res.json(sendPacket(1, 'Successfully removed user speaking privilege'));
  });

  app.post('/api/setConnectionID', isAuthenticatedWithJWT, (req, res) => {
    const { connection, webinarID, speaking_token } = req.body;
    if (!connection || !webinarID || !speaking_token)
      return res.json(
        sendPacket(
          -1,
          'connection, webinarID, or speaking_token missing from request body'
        )
      );

    if (!webinarCache[webinarID].speakingToken)
      return res.json(sendPacket(0, 'No guest speakers in current webinar'));

    if (webinarCache[webinarID].speakingToken !== speaking_token)
      return res.json(sendPacket(0, 'Speaking token does not match webinar'));

    webinarCache[webinarID].guestSpeaker.connection = connection;

    log('info', `New Connection: ${JSON.stringify(connection)}`);

    return res.json(
      sendPacket(1, 'Successfully updated connectionID for guest speaker')
    );
  });

  app.post('/api/removeViewerFromStream', isAuthenticatedWithJWT, (req, res) => {
    const { userID, webinarID } = req.body;
    if (!userID || !webinarID)
      return res.json(
        sendPacket(-1, 'userID or webinarID missing from request body')
      );

    if (!(webinarID in webinarCache)) {
      if (!(webinarID in waitingRooms)) {
        log('error', `Received invalid webinarID ${webinarID} for remove user`);
        return res.json(
          sendPacket(-1, 'Could not find webinarID in cache or waiting rooms')
        );
      }

      //CASE 1 - User is in the waiting Room
      const webinarWaitingRoom = waitingRooms[webinarID];
      if (userID in webinarWaitingRoom.users) {
        const userSocket = webinarWaitingRoom.users[userID].socket;
        userSocket.emit('removed-from-event');

        delete waitingRooms[webinarID].users[userID];

        log(
          'info',
          `Removed viewer ${userID} for event ${webinarID} from waiting room`
        );

        return res.json(sendPacket(1, 'Successfully removed viewer'));
      }

      log(
        'info',
        `Could not find viewer ${userID} to remove from event ${webinarID} in waiting room`
      );
      return res.json(sendPacket(0, 'Could not find user in waiting room'));
    }

    //CASE 2 - User is in the webinar cache
    const currWebinarCache = webinarCache[webinarID];
    if (!(userID in currWebinarCache.users)) {
      log(
        'info',
        `Could not find viewer ${userID} to remove from event ${webinarID} in cache`
      );
      return res.json(sendPacket(0, 'Could not find user in the webinar cache'));
    }

    const userSocket = currWebinarCache.users[userID];
    userSocket.emit('removed-from-event');

    delete webinarCache[webinarID].users[userID];

    log('info', `Removed viewer ${userID} for event ${webinarID} from cache`);
    return res.json(sendPacket(1, 'Successfully removed viewer'));
  });
};
