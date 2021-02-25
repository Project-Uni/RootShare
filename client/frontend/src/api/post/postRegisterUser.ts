import { makeRequest } from '../../helpers/functions';

type RegisterParams = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  accountType: 'student' | 'alumni' | 'faculty' | 'recruiter';
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
