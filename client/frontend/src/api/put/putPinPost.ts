import { makeRequest } from '../../helpers/functions';
import { stringify } from 'qs';

export const putPinPost = async ({
  postID,
  communityID,
}: {
  postID: string;
  communityID: string;
}) => {
  const query = stringify({ postID, communityID });
  const { data } = await makeRequest('PUT', `/api/v2/community/pin?${query}`);
  return data;
};
