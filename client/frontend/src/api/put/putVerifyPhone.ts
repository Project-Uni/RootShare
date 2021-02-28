import { makeRequest } from '../../helpers/functions';

export const putVerifyPhone = async ({
  code,
  email,
}: {
  code: string;
  email: string;
}) => {
  const { data } = await makeRequest('PUT', '/api/v2/auth/verify', {
    email,
    code,
  });
  return data;
};
