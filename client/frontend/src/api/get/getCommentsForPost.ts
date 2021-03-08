import { stringify } from 'query-string';
import { makeRequest } from '../../helpers/functions';
import { CommentType } from '../../main-platform/reusable-components/components/Comment.v2';

export const getCommentsForPost = async ({
  postID,
  startFromTimestamp,
}: {
  postID: string;
  startFromTimestamp?: string;
}) => {
  let query: string | undefined = undefined;
  if (startFromTimestamp)
    query = stringify({ startingTimestamp: startFromTimestamp });
  const { data } = await makeRequest<{ comments: CommentType[] }>(
    'GET',
    `/api/posts/comments/${postID}${query ? `?${query}` : ''}`
  );
  return data;
};
