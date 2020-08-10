import { Socket } from 'socket.io';

export type WebinarCache = {
  [key: string]: Webinar;
};

export type Webinar = {
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
