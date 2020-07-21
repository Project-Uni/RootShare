export const UPDATE_SOCKET = 'sockets:updateSocket';

export function updateSocket(socket: any) {
  return {
    type: UPDATE_SOCKET,
    payload: {
      socket,
    },
  };
}
