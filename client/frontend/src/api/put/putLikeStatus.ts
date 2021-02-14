import { makeRequest } from '../../helpers/functions';
import qs from 'query-string';

export const putLikeStatus = async (postID: string, action: 'like' | 'unlike') => {
  const params = qs.stringify({ postID, action });
  const { data } = await makeRequest('PUT', `/api/posts/likes?${params}`);
  return data;
};
