import { makeRequest } from '../../helpers/functions';
import { stringify } from 'qs';
import { LeanUser } from '../../helpers/types';

export type CommunityAboutServiceResponse = {
  description: string;
  admin: LeanUser; //Populated admin type
  // moderators?: LeanUser[]; //Populated Moderator type
  members: LeanUser;
};

export const getCommunityAbout = async (communityID: string) => {
  const query = stringify({
    communityID,
  });
  const { data } = await makeRequest<CommunityAboutServiceResponse>(
    'GET',
    `/api/v2/community?${query}`
  );
  return data;
};
