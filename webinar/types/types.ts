export const JWT_TOKEN_FIELDS = ["email", "_id"];

export const JWT_ACCESS_TOKEN_TIMEOUT = "30m";

export type WebinarCache = {
  [key: string]: Webinar;
};

export type Webinar = {
  users: {
    [key: string]: SocketIO.Socket;
  };
  speakingToken?: string;
  startTime: number;
};
