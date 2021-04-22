import { makeRequest } from '../../helpers/functions';

type SubmitCommentResponse = {
  comment: {
    createdAt: string;
    likes: string[];
    message: string;
    post: string;
    updatedAt: string;
    user: {
      email: string;
      firstName: string;
      lastName: string;
      major?: string;
      position?: string;
      work?: string;
      graduationYear: number;
      _id: string;
    };
    _id: string;
  };
};
export const postSubmitComment = async ({
  postID,
  message,
}: {
  postID: string;
  message: string;
}) => {
  const { data } = await makeRequest<SubmitCommentResponse>(
    'POST',
    `/api/comments/${postID}`,
    { message }
  );
  return data;
};
