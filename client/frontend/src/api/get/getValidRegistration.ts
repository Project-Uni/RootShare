import { stringify } from 'query-string';
import { makeRequest } from '../../helpers/functions';

export const getValidRegistration = async ({
  email,
  password,
  phoneNumber,
}: {
  email: string;
  password: string;
  phoneNumber: string;
}) => {
  const query = stringify({ email, password, phoneNumber });
  const { data } = await makeRequest<{
    initializationVector: string;
    encryptedPassword: string;
  }>('GET', `/api/v2/auth/validate?${query}`);
  return data;
};
