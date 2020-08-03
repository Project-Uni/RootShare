import * as socketio from "socket.io";

export const JWT_TOKEN_FIELDS = ["email", "_id"];

export const JWT_ACCESS_TOKEN_TIMEOUT = "30m";

export type WebinarCache = {
  [key: string]: Webinar;
};

export type Webinar = {
  users: {
    [key: string]: socketio.Socket;
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
