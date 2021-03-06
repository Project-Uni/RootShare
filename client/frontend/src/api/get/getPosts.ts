import { makeRequest } from '../../helpers/functions';
import { PostType } from '../../helpers/types';

export const getPosts = async ({
  postType,
}: {
  postType: {
    type:
      | 'general'
      | 'following'
      | 'community-external'
      | 'community-internal-student'
      | 'community-internal-alumni'
      | 'community-following';
    params?: {
      communityID: string;
    };
  };
}) => {
  const url = getPostsURL(postType);

  if (!url) {
    console.error('Invalid URL for getPosts');
    return {
      success: -1,
      message: 'Invalid URL for getPosts',
      content: { posts: [] },
    };
  }
  const { data } = await makeRequest<{ posts: PostType[] }>('GET', url);
  return data;
};

const getPostsURL = (postType: {
  type:
    | 'general'
    | 'following'
    | 'community-external'
    | 'community-internal-student'
    | 'community-internal-alumni'
    | 'community-following';
  params?: {
    communityID: string;
  };
}) => {
  switch (postType.type) {
    case 'general':
      return '/api/posts/feed/general';
    case 'following':
      return '/api/posts/feed/following';
    case 'community-external':
      return `/api/posts/community/${postType.params?.communityID}/external`;
    case 'community-internal-alumni':
      return `/api/posts/community/${postType.params?.communityID}/internal/current`;
    case 'community-internal-student':
      return `/api/posts/community/${postType.params?.communityID}/internal/alumni`;
    case 'community-following':
      return `/api/posts/community/${postType.params?.communityID}/following`;
    default:
      return '';
  }
};
