import { stringify } from 'qs';
import { makeRequest } from '../../../helpers/functions';

import { UserType } from '../../../helpers/types';

export const getCommunityAdminMemberData = async (communityID: string) => {
  const query = stringify({ communityID });
  const { data } = await makeRequest<{ members: UserType[] }>(
    'GET',
    `/api/community/admin/portal/memberData?${query}`
  );
  return data;
};
