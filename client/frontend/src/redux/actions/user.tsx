import { RootshareReduxState } from '../store/stateManagement';

export const UPDATE_USER = 'users:updateUser';
export const UPDATE_PROFILE_PICTURE = 'users:updateProfilePicture';
export const RESET_USER = 'users:logout';

export function updateUser(
  userInfo: {
    [key in keyof RootshareReduxState['user']]?: RootshareReduxState['user'][key];
  }
) {
  return {
    type: UPDATE_USER,
    payload: {
      ...userInfo,
    },
  };
}

export const updateProfilePicture = (profilePicture?: string) => {
  return { type: UPDATE_PROFILE_PICTURE, payload: { profilePicture } };
};

export const resetUser = () => {
  return { type: RESET_USER };
};
