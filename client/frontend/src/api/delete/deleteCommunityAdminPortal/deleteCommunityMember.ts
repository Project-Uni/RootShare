import { stringify } from 'query-string';
import { makeRequest } from '../../../helpers/functions';

export const deleteCommunityMember = async (communityID: string, userID: string) => {
  const params = stringify({ communityID, userID });
  const { data } = await makeRequest(
    'DELETE',
    `/api/community/admin/portal/member?${params}`
  );
  return data;
};
