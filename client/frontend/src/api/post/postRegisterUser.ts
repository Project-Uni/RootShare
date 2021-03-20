import { makeRequest } from '../../helpers/functions';
import { AccountType } from '../../helpers/types';

type RegisterParams = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  initializationVector: string;
  accountType: AccountType;
  university: string;
  state: string;
  graduationYear: number;
  major?: string;
  company?: string;
  jobTitle?: string;
};

type ServiceResponse = {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    _id: string;
    accountType: string;
    privilegeLevel: number;
    university: string;
    profilePicture?: string;
  };
  accessToken: string;
  refreshToken: string;
};

export const postRegisterUser = async (params: RegisterParams) => {
  const { data } = await makeRequest<ServiceResponse>(
    'POST',
    '/api/v2/auth/register',
    { ...params }
  );
  return data;
};
