import { Server } from 'socket.io';
import log from '../helpers/logger';
import { WaitingRooms, WebinarCache } from '../types/types';

export function broadcastEventStart(
  io: Server,
  webinarID: string,
  waitingRooms: WaitingRooms,
  webinarCache: WebinarCache
) {
  io.to(`webinar_${webinarID}`).emit('event-started');
  log(
    'info',
    `Broadcasted to waiting room for ${webinarID} that event has started.`
  );
  if (waitingRooms[webinarID]) {
    const userIDs = Object.keys(waitingRooms[webinarID].users);
    for (let i = 0; i < userIDs.length; i++) {
      const currID = userIDs[i];
      const userSocket = waitingRooms[webinarID].users[currID].socket;
      webinarCache[webinarID].users[currID] = userSocket;
    }
    log(
      'info',
      `Added all users from waiting room for webinar ${webinarID} to cache`
    );
    log('info', `Waiting Rooms: ${Object.keys(waitingRooms)}`);
    delete waitingRooms[webinarID];
  }
}
