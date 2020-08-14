import { UPDATE_MESSAGE_SOCKET, RESET_MESSAGE_SOCKET } from '../actions/sockets';

export function messageSocketReducer(
  state = {},
  data: { type: string; payload: { messageSocket?: SocketIOClient.Socket } }
) {
  const { type, payload } = data;
  switch (type) {
    case UPDATE_MESSAGE_SOCKET:
      return payload.messageSocket!;
    case RESET_MESSAGE_SOCKET:
      return payload;
    default:
      return state;
  }
}
