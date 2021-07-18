import { stringify } from 'query-string';
import { makeRequest } from '../../../helpers/functions';

export const deleteCommunityBoardMember = async (
  communityID: string,
  userID: string
) => {
  const params = stringify({ communityID, userID });
  const { data } = await makeRequest(
    'DELETE',
    `/api/communityAdmin/board?${params}`
  );
  return data;
};
