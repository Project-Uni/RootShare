import { ReduxAction } from '.';

export const UPDATE_REGISTRATION_FIELDS = 'registration:updateRegFields';
export const UPDATE_REGISTRATION_ACCOUNT_TYPE = 'registration:updateAccountType';
export const RESET_REGISTRATION = 'registration:reset';
export const SET_REGISTRATION_VERIFIED = 'registration:updateVerified';

export const updateBasicRegistrationFields = (data: {
  email: string;
  phoneNumber: string;
  password: string;
}): ReduxAction => ({
  type: UPDATE_REGISTRATION_FIELDS,
  payload: data,
});

export const updateRegistrationAccountType = (
  accountType: 'student' | 'alumni' | 'faculty' | 'recruiter'
): ReduxAction => ({
  type: UPDATE_REGISTRATION_ACCOUNT_TYPE,
  payload: { accountType },
});

export const resetRegistration = (): ReduxAction => ({
  type: RESET_REGISTRATION,
});

export const setRegistrationVerified = (): ReduxAction => ({
  type: SET_REGISTRATION_VERIFIED,
});
