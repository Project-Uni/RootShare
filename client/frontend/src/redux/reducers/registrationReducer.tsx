import { initializeState, RootshareReduxState } from '../store/stateManagement';
import {
  UPDATE_REGISTRATION_ACCOUNT_TYPE,
  UPDATE_REGISTRATION_FIELDS,
  RESET_REGISTRATION,
  SET_REGISTRATION_VERIFIED,
} from '../actions/registration';

export const registrationReducer = (
  state: RootshareReduxState['registration'] = initializeState().registration,
  data: {
    type:
      | typeof UPDATE_REGISTRATION_ACCOUNT_TYPE
      | typeof UPDATE_REGISTRATION_FIELDS
      | typeof RESET_REGISTRATION
      | typeof SET_REGISTRATION_VERIFIED;
    payload?: {
      email?: string;
      password?: string;
      phoneNumber?: string;
      accountType?: 'student' | 'alumni' | 'faculty' | 'recruiter';
    };
  }
): RootshareReduxState['registration'] => {
  const { type, payload } = data;
  switch (type) {
    case UPDATE_REGISTRATION_FIELDS:
      return {
        ...payload,
      };
    case SET_REGISTRATION_VERIFIED:
      return { ...state, verified: true };
    case UPDATE_REGISTRATION_ACCOUNT_TYPE:
      return { ...state, accountType: payload?.accountType };
    case RESET_REGISTRATION:
      return initializeState().registration;
    default:
      return state;
  }
};
