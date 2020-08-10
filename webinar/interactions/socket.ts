import { Server } from 'socket.io';
import log from '../helpers/logger';

export function broadcastEventStart(io: Server, webinarID) {
  io.to(`webinar_${webinarID}`).emit('event-started');
  log(
    'info',
    `Broadcasted to waiting room for ${webinarID} that event has started.`
  );
}
