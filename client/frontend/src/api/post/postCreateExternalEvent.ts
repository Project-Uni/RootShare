import { makeRequest } from '../../helpers/functions';
import { ExternalEvent } from '../../helpers/types';
import { ExternalEventPrivacyEnum } from '../../helpers/enums';

type IPostCreateExternalEventParams = {
  title: string;
  description: string;
  type: string;
  streamLink: string;
  donationLink: string;
  startTime: string;
  endTime: string;
  communityID: string;
  privacy: ExternalEventPrivacyEnum;
  image: string;
  isDev?: boolean;
};

export type IPostCreateExternalEventResponse = {
  event: ExternalEvent;
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
