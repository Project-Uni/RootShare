export const UPDATE_USER = 'users:updateUser';

export function updateUser(userInfo: { [key: string]: any; }) {
  return {
    type: UPDATE_USER,
    payload: {
      user: userInfo,
    },
  };
}