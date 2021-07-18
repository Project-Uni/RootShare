import { stringify } from 'qs';
import { makeRequest } from '../../../helpers/functions';

export const getIsCommunityAdminCheck = async (communityID: string) => {
  const query = stringify({ communityID });
  const { data } = await makeRequest<{ isCommunityAdmin: boolean }>(
    'GET',
    `/api/communityAdmin/check?${query}`
  );
  return (data as unknown) as {
    successful: boolean;
    message: string;
    content: { isCommunityAdmin: boolean };
    status: number;
  };
};
