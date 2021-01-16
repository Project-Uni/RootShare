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
  speakingTokens: string[];
  guestSpeakers: GuestSpeaker[];
  startTime: number;
};

type GuestSpeaker = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  speakingToken: string;
  connection?: { [key: string]: any };
};
