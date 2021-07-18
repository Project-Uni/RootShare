import { stringify } from 'qs';
import { makeRequest } from '../../helpers/functions';
import { ExternalEventDefault } from '../../helpers/types';

export type GetExternalEventInfoCommunity = {
  _id: string;
  name: string;
};

type GetExternalEventInfoResponse = {
  event: ExternalEventDefault;
  isAdmin: boolean;
  community?: GetExternalEventInfoCommunity;
};

export const getExternalEventInfo = async (eventID: string, userID?: string) => {
  const query = stringify({ eventID, userID });
  const { data } = await makeRequest<GetExternalEventInfoResponse>(
    'GET',
    `/api/event/external?${query}`
  );
  return (data as unknown) as {
    successful: boolean;
    message: string;
    content: GetExternalEventInfoResponse;
    status: number;
  };
};
