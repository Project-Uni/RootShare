import { makeRequest } from '../../helpers/functions';

export const getCommunityMedia = async ({
  communityID,
}: {
  communityID: string;
}) => {
  const { data } = await makeRequest<{ imageURLs: string[] }>(
    'GET',
    `/api/community/${communityID}/media`
  );
  return data;
};
