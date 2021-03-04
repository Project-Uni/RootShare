import { makeRequest } from '../../helpers/functions';

export const putResendPhoneVerification = async ({
  phoneNumber,
  email,
}: {
  phoneNumber: string;
  email: string;
}) => {
  const { data } = await makeRequest('PUT', '/api/v2/auth/resend', {
    email,
    phoneNumber,
  });
  return data;
};
