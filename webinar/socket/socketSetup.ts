import * as socketio from 'socket.io';
import log from '../helpers/logger';
import checkSpeakingTokenMatches from '../helpers/speakingToken';

import { Webinar } from '../database/models';

import { WebinarCache, WaitingRooms } from '../types/types';

module.exports = (
  io: socketio.Server,
  webinarCache: WebinarCache,
  waitingRooms: WaitingRooms
) => {
  io.on('connection', (socket: socketio.Socket) => {
    let socketUserId = '';
    let socketUserFirstName = '';
    let socketUserLastName = '';
    let socketUserEmail = '';

    let socketWebinarId = '';
    log('connection', `${socket.client.id}`);

    socket.on(
      'new-user',
      async (data: {
        webinarID: string;
        userID: string;
        firstName: string;
        lastName: string;
        email: string;
      }) => {
        const { userID, webinarID, firstName, lastName, email } = data;
        if (!userID || !webinarID || !firstName || !lastName || !email) {
          return log('alert', 'Invalid socket connection received');
        }
        log('new-user', `${userID}`);

        socketUserId = userID;
        socketUserFirstName = firstName;
        socketUserLastName = lastName;
        socketUserEmail = email;

        socketWebinarId = webinarID;

        if (webinarID in webinarCache) {
          socket.join(`webinar_${webinarID}`);
          webinarCache[webinarID].users[userID] = socket;
          return log(
            'info',
            `Successfully added user ${socketUserFirstName} ${socketUserLastName} to cache for webinar ${webinarID}`
          );
        }

        try {
          const webinarExists = await Webinar.exists({ _id: webinarID });
          if (!webinarExists) {
            socket.emit('webinar-error', 'WebinarID not valid');
            return log('error', 'Invalid webinarID received');
          }

          //Webinar exists
          if (!(webinarID in waitingRooms)) {
            waitingRooms[webinarID] = { users: {}, host: undefined };
          }
          waitingRooms[webinarID].users[userID] = {
            socket: socket,
            joinedAt: Date.now(),
          };

          socket.join(`webinar_${webinarID}`);

          socket.emit(
            'waiting-room-add',
            `You have been added to the waiting room for ${webinarID}`
          );
          return log(
            'info',
            `Added user ${firstName} ${lastName} to waiting room for webinar ${webinarID}`
          );
        } catch (err) {
          socket.emit(
            'webinar-error',
            'There was an error connecting to the database'
          );
          return log('error', err);
        }
      }
    );

    socket.on('disconnect', () => {
      log('disconnect', `${socketUserId}`);
      const webinarExists = socketWebinarId in webinarCache;
      if (webinarExists) {
        const userExists = socketUserId in webinarCache[socketWebinarId].users;
        if (userExists) delete webinarCache[socketWebinarId].users[socketUserId];
      }
    });

    socket.on('speaking-invite-accepted', (data: { speakingToken: string }) => {
      //TODO - Notify the host that user has accepted speaking invite
      const { speakingToken } = data;
      log('info', `Speaking invite accepted with token: ${speakingToken}`);
      if (
        !checkSpeakingTokenMatches(
          webinarCache[socketWebinarId].speakingTokens,
          speakingToken
        )
      ) {
        log('socket', 'Speaking token was rejected');
        return socket.emit('speaking-token-rejected');
      }
      log('socket', 'Speaking token was accepted');
      webinarCache[socketWebinarId].guestSpeakers.push({
        _id: socketUserId,
        firstName: socketUserFirstName,
        lastName: socketUserLastName,
        email: socketUserEmail,
        speakingToken,
      });
      socket.emit('speaking-token-accepted');
    });

    socket.on('speaking-invite-rejected', () => {
      //TODO - Notify the host that user has rejected speaking invite
      log('socket', 'Speaking invite rejected');
    });

    // Get request from a viewer's Socket and send to host's Socket
    socket.on('request-to-speak', () => {
      if (socketWebinarId in webinarCache && webinarCache[socketWebinarId].host)
        webinarCache[socketWebinarId].host.emit('request-to-speak', {
          _id: socketUserId,
          firstName: socketUserFirstName,
          lastName: socketUserLastName,
        });
    });

    // HOST SOCKET SETUP
    socket.on('new-host', async (webinarID: string) => {
      if (!webinarID) return log('alert', 'Invalid socket connection received');

      log('new-host', 'The host socket is being added');

      if (webinarID in webinarCache) {
        webinarCache[webinarID].host = socket;
        return log(
          'info',
          `Successfully added host to cache for webinar ${webinarID}`
        );
      }

      try {
        const webinarExists = await Webinar.exists({ _id: webinarID });
        if (!webinarExists) return log('error', 'Invalid webinarID received');

        //Webinar exists
        if (webinarID in waitingRooms) waitingRooms[webinarID].host = socket;
        else waitingRooms[webinarID] = { users: {}, host: socket };

        return log('info', `Added host to waiting room for webinar ${webinarID}`);
      } catch (err) {
        return log('error', err);
      }
    });
  });
};
