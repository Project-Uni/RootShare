import { stringify } from 'query-string';
import { makeRequest } from '../../helpers/functions';

type CommentResponse = {
  comments: {
    createdAt: string;
    _id: string;
    message: string;
    user: {
      firstName: string;
      lastName: string;
      _id: string;
      profilePicture?: string;
      major?: string;
      graduationYear: number;
      work?: string;
      position?: string;
    };
    updatedAt: string;
  }[];
};
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
  const { data } = await makeRequest<CommentResponse>(
    'GET',
    `/api/posts/comments/${postID}${query ? `?${query}` : ''}`
  );
  return data;
};
