import { stringify } from 'qs';
import { makeRequest } from '../../../helpers/functions';

import { UserAvatar } from '../../../helpers/types';

export const getCommunityPendingMembers = async (communityID: string) => {
  const query = stringify({ communityID });
  const { data } = await makeRequest<{
    pendingMembers: UserAvatar[];
  }>('GET', `/api/community/admin/portal/pending?${query}`);
  return data;
};
