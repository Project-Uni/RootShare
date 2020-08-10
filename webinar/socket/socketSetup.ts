import * as socketio from 'socket.io';
import log from '../helpers/logger';

import { Webinar } from '../database/models';

import { WebinarCache, WaitingRooms } from '../types/types';
import { emit } from 'process';

module.exports = (io, webinarCache: WebinarCache, waitingRooms: WaitingRooms) => {
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

        if (!(webinarID in webinarCache)) {
          try {
            const webinars = await Webinar.find(
              { _id: webinarID },
              { _id: 1 }
            ).limit(1);
            if (webinars.length === 0) {
              //Webinar does not exist
              socket.emit('webinar-error', 'WebinarID not valid');
              return log('error', 'Invalid webinarID received');
            }

            //Webinar exists
            if (!(webinarID in waitingRooms)) {
              waitingRooms[webinarID] = { users: {} };
            }
            waitingRooms[webinarID].users[userID] = {
              socket: socket,
              joinedAt: Date.now(),
            };

            console.log('Waiting Rooms:', waitingRooms);

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
        socket.join(`${webinarID}`);

        webinarCache[webinarID].users[userID] = socket;
        log(
          'info',
          `Successfully added user ${socketUserFirstName} ${socketUserLastName} to cache for webinar ${webinarID}`
        );
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

    socket.on('speaking-invite-accepted', (data: { speaking_token: string }) => {
      //TODO - Notify the host that user has accepted speaking invite
      const { speaking_token } = data;
      log('info', `Speaking invite accepted with token: ${speaking_token}`);
      if (
        !webinarCache[socketWebinarId].speakingToken ||
        webinarCache[socketWebinarId].speakingToken !== speaking_token
      ) {
        log('socket', 'Speaking token was rejected');
        return socket.emit('speaking-token-rejected');
      }
      log('socket', 'Speaking token was accepted');
      webinarCache[socketWebinarId].guestSpeaker = {
        _id: socketUserId,
        firstName: socketUserFirstName,
        lastName: socketUserLastName,
        email: socketUserEmail,
      };
      socket.emit('speaking-token-accepted');
    });

    socket.on('speaking-invite-rejected', () => {
      //TODO - Notify the host that user has rejected speaking invite
      log('socket', 'Speaking invite rejected');
    });
  });
};
