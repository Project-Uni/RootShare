export const UPDATE_MESSAGE_SOCKET = 'messageSockets:updateMessageSocket';

export function updateMessageSocket(messageSocket: SocketIOClient.Socket) {
  return {
    type: UPDATE_MESSAGE_SOCKET,
    payload: {
      messageSocket,
    },
  };
}
