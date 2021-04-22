import { makeRequest } from '../../helpers/functions';
import qs from 'query-string';

export const putPostLikeStatus = async (postID: string, liked: boolean) => {
  const params = qs.stringify({ postID, liked });
  const { data } = await makeRequest('PUT', `/api/posts/like?${params}`);
  return data;
};
