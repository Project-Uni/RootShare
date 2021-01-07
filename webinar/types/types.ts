import { Socket } from 'socket.io';

export type WebinarCache = {
  [key: string]: Webinar;
};

export type WaitingRooms = {
  [key: string]: WaitingRoom;
};

export type WaitingRoom = {
  host: Socket;
  users: {
    [key: string]: {
      socket: Socket;
      joinedAt: number;
    };
  };
};

export type Webinar = {
  host: Socket;
  users: {
    [key: string]: Socket;
  };
  speakingToken?: string;
  guestSpeaker?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    connection?: { [key: string]: any };
  };
  startTime: number;
};
