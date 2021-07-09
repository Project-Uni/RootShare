import { makeRequest } from '../../helpers/functions';
import { PrivacyEnum } from '../../main-platform/community/redesign/modals/CommunityExternalEventCreate';

type IPostCreateExternalEventParams = {
  title: string;
  description: string;
  type: string;
  streamLink: string;
  donationLink: string;
  startTime: string;
  endTime: string;
  communityID: string;
  privacy: PrivacyEnum;
  image: string;
  isDev?: boolean;
};

export type IPostCreateExternalEventResponse = {
  event: {
    _id: string;
    title: string;
    type: string;
    description: string;
    streamLink: string;
    donationLink: string;
    startTime: string;
    endTime: string;
    hostCommunity: string;
    createdByUserID: string;
    privacy: PrivacyEnum;
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
    `/api/communityAdmin/event`,
    params
  );

  return (data as unknown) as {
    successful: boolean;
    message: string;
    content: IPostCreateExternalEventResponse;
    status: number;
  };
};
