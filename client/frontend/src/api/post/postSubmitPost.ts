import { makeRequest } from '../../helpers/functions';
import { PostType } from '../../helpers/types';

export type SubmitPostArgs = {
  type:
    | 'broadcast-user'
    | 'broadcast-community'
    | 'community-external-user'
    | 'community-external-admin'
    | 'community-external-following-admin'
    | 'community-internal-student'
    | 'community-internal-alumni';
  params?: {
    toCommunityID?: string;
    fromCommunityID?: string;
  };
  message: string;
  image?: string;
};

export const postSubmitPost = async ({
  type,
  params,
  message,
  image,
}: SubmitPostArgs) => {
  const url = getUrl({ type, params });
  if (!url) {
    console.error('Invalid Parameters for postSubmitPost');
    return {
      success: -1,
      message: 'Invalid Parameters for postSubmitPost',
      content: { post: undefined },
    };
  }

  const args = {
    message,
    image,
    fromCommunityID: params?.fromCommunityID,
  };

  const { data } = await makeRequest<{ post: PostType }>('POST', url, args);
  return data;
};

const getUrl = ({
  type,
  params,
}: {
  type: SubmitPostArgs['type'];
  params: SubmitPostArgs['params'];
}) => {
  if (type === 'broadcast-user') return '/api/posts/broadcast/user';

  if (!params?.toCommunityID) return '';

  let communityURLBase = `/api/posts/community/${params?.toCommunityID}`;

  switch (type) {
    case 'broadcast-community':
      return `${communityURLBase}/broadcast`;
    case 'community-external-user':
      return `${communityURLBase}/external/member`;
    case 'community-external-admin':
      return `${communityURLBase}/external/admin`;
    case 'community-external-following-admin':
      return `${communityURLBase}/external/following`;
    case 'community-internal-student':
      return `${communityURLBase}/internal/current`;
    case 'community-internal-alumni':
      return `${communityURLBase}/internal/alumni`;
    default:
      return '';
  }
};
