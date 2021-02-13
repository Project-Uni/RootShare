import { UPDATE_USER, UPDATE_PROFILE_PICTURE, RESET_USER } from '../actions/user';
import { initializeState } from '../store/stateManagement';
import { RootshareReduxState } from '../store/stateManagement';

const initialState = initializeState().user;

export default function userReducer(
  state = initialState,
  data: {
    type: typeof UPDATE_USER | typeof UPDATE_PROFILE_PICTURE | typeof RESET_USER;
    payload?: {
      [key in keyof RootshareReduxState['user']]?: RootshareReduxState['user'][key];
    };
  }
): RootshareReduxState['user'] {
  const { type, payload } = data;
  switch (type) {
    case UPDATE_USER:
      return {
        ...state,
        ...payload,
      };
    case UPDATE_PROFILE_PICTURE:
      return {
        ...state,
        profilePicture: payload?.profilePicture,
        profilePictureLastUpdated: new Date(),
      };
    case RESET_USER:
      return initialState;
    default:
      return state;
  }
}
