import { makeRequest } from '../../helpers/functions';
import { stringify } from 'qs';

export const getPinnedPosts = async ({ communityID }: { communityID: string }) => {
  const query = stringify({ communityID });
  const { data } = await makeRequest(
    'GET',
    `/api/v2/community/pinnedPosts?${query}`
  );

  return data;
};
