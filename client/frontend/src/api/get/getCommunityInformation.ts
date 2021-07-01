import { stringify } from 'qs';

import { makeRequest } from '../../helpers/functions';
import { Community } from '../../helpers/types';

export const getCommunityInformation = async (communityID: string) => {
  const query = stringify({ communityID });
  const { data } = await makeRequest<{
    community: Community;
    mutualConnections: string[];
  }>('GET', `/api/community/info?${query}`);
  return data;
};
