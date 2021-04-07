import { makeRequest } from '../../helpers/functions';
import { stringify } from 'qs';

export const putCommunityInvite = async ({
  invitedIDs,
  communityID,
}: {
  invitedIDs: string[];
  communityID: string;
}) => {
  const { data } = await makeRequest('PUT', `/api/v2/community/invite`, {
    invitedIDs,
    communityID,
  });

  return data;
};
