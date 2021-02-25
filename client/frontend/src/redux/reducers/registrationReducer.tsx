import { initializeState } from '../store/stateManagement';
import {
  UPDATE_REGISTRATION_ACCOUNT_TYPE,
  UPDATE_REGISTRATION_FIELDS,
  RESET_REGISTRATION,
} from '../actions/registration';

export const registrationReducer = (
  state = initializeState().registration,
  data: {
    type:
      | typeof UPDATE_REGISTRATION_ACCOUNT_TYPE
      | typeof UPDATE_REGISTRATION_FIELDS
      | typeof RESET_REGISTRATION;
    payload?: {
      email?: string;
      password?: string;
      phoneNumber?: string;
      accountType?: string;
    };
  }
) => {
  const { type, payload } = data;
  switch (type) {
    case UPDATE_REGISTRATION_FIELDS:
      return { ...payload };
    case UPDATE_REGISTRATION_ACCOUNT_TYPE:
      return { ...state, accountType: payload?.accountType };
    case RESET_REGISTRATION:
      return initializeState().registration;
    default:
      return state;
  }
};
