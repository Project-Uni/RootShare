import { makeRequest } from '../../helpers/functions';
import { stringify } from 'query-string';

export const putUpdatetUserConnection = async (
  toUser: string,
  action: 'connect' | 'reject' | 'accept' | 'remove'
) => {
  const params = stringify({ toUser, action });
  const { data } = await makeRequest('POST', `/api/v2/user/connect?${params}`);
};
