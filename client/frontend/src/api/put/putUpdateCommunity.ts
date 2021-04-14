import { makeRequest } from '../../helpers/functions';
import { stringify } from 'query-string';
import { CommunityType } from '../../helpers/types';

export const putUpdateCommunity = async (
  communityID: string,
  fields: {
    name?: string;
    description?: string;
    type?: CommunityType;
    private?: boolean;
  }
) => {
  const params = stringify({ ...fields });
  const { data } = await makeRequest(
    'PUT',
    `/api/community/${communityID}/update?${params}`
  );
  return data;
};
