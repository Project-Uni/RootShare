import qs from 'query-string';
import { makeRequest } from '../../../helpers/functions';

export const putPendingMember = async (
  communityID: string,
  userID: string,
  action: 'reject' | 'accept'
) => {
  const params = qs.stringify({ communityID, userID, action });
  const { data } = await makeRequest(
    'PUT',
    `/api/community/admin/portal/pending?${params}`
  );
  return data;
};
