import { stringify } from 'qs';
import { makeRequest } from '../../helpers/functions';
import { ExternalEventDefault } from '../../helpers/types';
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
  event: ExternalEventDefault;
};

export const postCreateExternalEvent = async (
  communityID: string,
  body: IPostCreateExternalEventParams
) => {
  const params = stringify({ communityID });
  const { data } = await makeRequest<IPostCreateExternalEventResponse>(
    'post',
    `/api/communityAdmin/event?${params}`,
    body
  );

  return (data as unknown) as {
    successful: boolean;
    message: string;
    content: IPostCreateExternalEventResponse;
    status: number;
  };
};
