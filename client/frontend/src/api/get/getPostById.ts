import { makeRequest } from '../../helpers/functions';
import { stringify } from 'qs';
import { PostType } from '../../helpers/types';

export const getPostById = async (postID: string) => {
  const query = stringify({ _id: postID });
  const { data } = await makeRequest<{ post: PostType }>(
    'GET',
    `/api/post?${query}`
  );
  return data;
};
