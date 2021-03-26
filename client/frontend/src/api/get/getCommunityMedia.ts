import { makeRequest } from '../../helpers/functions';
import { ImageType } from '../../helpers/types';

export const getCommunityMedia = async ({
  communityID,
}: {
  communityID: string;
}) => {
  const { data } = await makeRequest<{ images: ImageType[] }>(
    'GET',
    `/api/community/${communityID}/media`
  );
  return data;
};
