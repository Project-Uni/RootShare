export const UPDATE_MESSAGE_SOCKET = 'messageSockets:updateMessageSocket';
export const RESET_MESSAGE_SOCKET = 'messageSockets:resetMessageSocket';

export function updateMessageSocket(messageSocket: SocketIOClient.Socket) {
  return {
    type: UPDATE_MESSAGE_SOCKET,
    payload: {
      messageSocket,
    },
  };
}

export function resetMessageSocket() {
  return {
    type: RESET_MESSAGE_SOCKET,
    payload: {},
  };
}
