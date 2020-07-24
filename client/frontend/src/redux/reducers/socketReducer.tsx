import { UPDATE_SOCKET } from '../actions/socket';

export function socketReducer(
  state = {},
  data: { type: string; payload: { socket: any } }
) {
  const { type, payload } = data;
  switch (type) {
    case UPDATE_SOCKET:
      return payload.socket;
    default:
      return state;
  }
}