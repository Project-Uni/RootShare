import { makeRequest } from '../../helpers/functions';
import { stringify } from 'query-string';

export const putUpdateUserConnection = async (
  action: 'connect' | 'reject' | 'accept' | 'remove' | 'cancel',
  otherUserID: string
) => {
  const params = stringify({ action, otherUserID });
  const { data } = await makeRequest('PUT', `/api/v2/user/connect?${params}`);
  return data;
};
