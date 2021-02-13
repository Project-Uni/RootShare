import { makeRequest } from '../../helpers/functions';
import { stringify } from 'query-string';

export const putUserToCommunityRelationship = async (
  action: 'join' | 'cancel' | 'leave',
  communityID: string
) => {
  const params = stringify({ action, communityID });
  const { data } = await makeRequest(
    'PUT',
    `/api/v2/community/relationship?${params}`
  );
  return data;
};
