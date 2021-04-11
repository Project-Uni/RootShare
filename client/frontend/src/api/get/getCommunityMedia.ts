import { makeRequest } from '../../helpers/functions';
import { ImageType, Link } from '../../helpers/types';

export const getCommunityMedia = async ({
  communityID,
}: {
  communityID: string;
}) => {
  const { data } = await makeRequest<{ images: ImageType[]; links: Link[] }>(
    'GET',
    `/api/community/${communityID}/media`
  );
  return data;
};
