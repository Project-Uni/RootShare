import { stringify } from 'qs';
import { makeRequest } from '../../../helpers/functions';

import { UserType } from '../../../helpers/types';

export const getCommunityAdminMemberData = async (communityID: string) => {
  const query = stringify({ communityID });
  const { data } = await makeRequest<{ members: UserType[] }>(
    'GET',
    `/api/communityAdmin/memberData?${query}`
  );
  return data;
};
