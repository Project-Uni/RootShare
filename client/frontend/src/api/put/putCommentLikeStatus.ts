import { makeRequest } from '../../helpers/functions';
import qs from 'query-string';

export const putCommentLikeStatus = async (
  commentID: string,
  postID: string,
  liked: boolean
) => {
  const params = qs.stringify({ commentID, postID, liked });
  const { data } = await makeRequest('PUT', `/api/comments/like?${params}`);
  return data;
};
