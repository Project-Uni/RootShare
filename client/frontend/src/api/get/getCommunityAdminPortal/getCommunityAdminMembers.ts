import { stringify } from 'qs';
import { makeRequest } from '../../../helpers/functions';

import { UserAvatar } from '../../../helpers/types';

export type BoardMember = UserAvatar & { title: string };

type MembersResponse = {
  members: UserAvatar[];
  pendingMembers: UserAvatar[];
  boardMembers: BoardMember[];
};

export const getCommunityAdminMembers = async (communityID: string) => {
  const query = stringify({ communityID });
  const { data } = await makeRequest<MembersResponse>(
    'GET',
    `/api/community/admin/portal/members?${query}`
  );
  return data;
};