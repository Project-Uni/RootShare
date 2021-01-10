const crypto = require('crypto');

import log from '../helpers/logger';
import sendPacket from '../helpers/sendPacket';
import { isAuthenticatedWithJWT } from '../middleware/isAuthenticated';
import { WebinarCache, WaitingRooms } from '../types/types';
import checkSpeakingTokenMatches from '../helpers/speakingToken';

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

    const speakingToken = crypto.randomBytes(64).toString();
    webinarCache[webinarID].speakingTokens.push(speakingToken);

    socket.emit('speaking-invite', { speakingToken: speakingToken, sessionID });
    return res.json(
      sendPacket(1, 'Successfully invited user to speak', { speakingToken })
    );
  });

  app.post('/api/removeGuestSpeaker', isAuthenticatedWithJWT, (req, res) => {
    const { webinarID, speakingToken } = req.body;
    if (!webinarID)
      return res.json(sendPacket(-1, 'webinarID missing from request body'));

    if (!(webinarID in webinarCache))
      return res.json(sendPacket(-1, 'Webinar not in cache'));

    let speakerID;
    webinarCache[webinarID].guestSpeakers.forEach((guestSpeaker) => {});

    const currWebinar = webinarCache[webinarID];
    let currSpeakers = currWebinar.guestSpeakers;
    for (let i = 0; i < currSpeakers.length; i++) {
      if (currSpeakers[i].speakingToken === speakingToken) {
        speakerID = currSpeakers[i]._id;
        currSpeakers.splice(i, 1);
        break;
      }
    }

    for (let i = 0; i < currWebinar.speakingTokens.length; i++) {
      if (currWebinar.speakingTokens[i] === speakingToken) {
        currWebinar.speakingTokens.splice(i, 1);
        break;
      }
    }

    // if (!webinarCache[webinarID].guestSpeaker.connection?.connectionId) {
    //   return res.json(sendPacket(0, 'Still waiting for connection to initialize'));
    // }

    if (!(speakerID in webinarCache[webinarID].users))
      return res.json(sendPacket(0, 'User already left the stream'));

    const socket = webinarCache[webinarID].users[speakerID];
    socket.emit('speaking-revoke');

    return res.json(sendPacket(1, 'Successfully removed user speaking privilege'));
  });

  app.post('/api/setConnectionID', isAuthenticatedWithJWT, (req, res) => {
    const { connection, webinarID, speakingToken } = req.body;
    if (!connection || !webinarID || !speakingToken)
      return res.json(
        sendPacket(
          -1,
          'connection, webinarID, or speakingToken missing from request body'
        )
      );

    const currWebinar = webinarCache[webinarID];
    if (currWebinar.speakingTokens.length === 0)
      return res.json(sendPacket(0, 'No guest speakers in current webinar'));

    if (!checkSpeakingTokenMatches(currWebinar.speakingTokens, speakingToken))
      return res.json(sendPacket(0, 'Speaking token does not match webinar'));

    for (let i = 0; i < currWebinar.guestSpeakers.length; i++) {
      if (currWebinar.guestSpeakers[i].speakingToken === speakingToken) {
        currWebinar.guestSpeakers[i].connection = connection;
        break;
      }
    }

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
