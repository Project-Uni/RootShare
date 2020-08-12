import { UPDATE_MESSAGE_SOCKET } from '../actions/sockets';

export function messageSocketReducer(
  state = {},
  data: { type: string; payload: { messageSocket: SocketIOClient.Socket } }
) {
  const { type, payload } = data;
  switch (type) {
    case UPDATE_MESSAGE_SOCKET:
      return payload.messageSocket;
    default:
      return state;
  }
}
