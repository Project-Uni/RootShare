import { makeRequest } from '../../helpers/functions';
import { Privacy } from '../../main-platform/community/redesign/modals/CommunityExternalEventCreate';

type IPostCreateExternalEventParams = {
  title: string;
  description: string;
  type: string;
  streamLink: string;
  donationLink: string;
  startTime: string;
  endTime: string;
  communityID: string;
  privacy: Privacy;
  image: string;
  isDev?: boolean;
};

export type IPostCreateExternalEventResponse = {
  event: {
    title: string;
    type: string;
    description: string;
    streamLink: string;
    donationLink: string;
    startTime: string;
    endTime: string;
    hostCommunity: string;
    createdByUserID: string;
    privacy: Privacy;
    banner: string;
    isDev: boolean;
    createdAt: string;
    updatedAt: string;
  };
};

export const postCreateExternalEvent = async (
  params: IPostCreateExternalEventParams
) => {
  const { data } = await makeRequest<IPostCreateExternalEventResponse>(
    'post',
    `/api/webinar/external`,
    params
  );

  return data;
};
