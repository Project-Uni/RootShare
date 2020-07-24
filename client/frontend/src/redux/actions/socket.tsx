export const UPDATE_SOCKET = 'sockets:updateSocket';

export function updateSocket(socket: SocketIOClient.Socket) {
  return {
    type: UPDATE_SOCKET,
    payload: {
      socket,
    },
  };
}
