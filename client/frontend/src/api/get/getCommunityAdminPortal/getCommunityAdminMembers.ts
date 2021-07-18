import { stringify } from 'qs';
import { makeRequest } from '../../../helpers/functions';

import { UserAvatar, BoardMember } from '../../../helpers/types';

type MembersResponse = {
  members: UserAvatar[];
  pendingMembers: UserAvatar[];
  boardMembers: BoardMember[];
};

export const getCommunityAdminMembers = async (communityID: string) => {
  const query = stringify({ communityID });
  const { data } = await makeRequest<MembersResponse>(
    'GET',
    `/api/communityAdmin/members?${query}`
  );
  return data;
};
