import { makeRequest } from '../../helpers/functions';

export const deletePost = async ({ postID }: { postID: string }) => {
  const { data } = await makeRequest('DELETE', `/api/posts/delete/${postID}`);
  return data;
};
