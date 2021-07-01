import qs from 'query-string';
import { makeRequest } from '../../../helpers/functions';

export const putCommunityBoardMember = async (
  communityID: string,
  userID: string,
  title: string
) => {
  const params = qs.stringify({ communityID, userID, title });
  const { data } = await makeRequest(
    'PUT',
    `/api/community/admin/portal/board?${params}`
  );
  return data;
};
