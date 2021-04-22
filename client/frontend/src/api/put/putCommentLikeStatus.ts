import { makeRequest } from '../../helpers/functions';
import qs from 'query-string';

export const putCommentLikeStatus = async (commentID: string, liked: boolean) => {
  const params = qs.stringify({ commentID, liked });
  const { data } = await makeRequest('PUT', `/api/comments/like?${params}`);
  return data;
};
