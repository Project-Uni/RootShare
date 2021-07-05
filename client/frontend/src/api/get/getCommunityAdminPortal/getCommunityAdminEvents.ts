import { stringify } from 'qs';
import { makeRequest } from '../../../helpers/functions';
import { IPostCreateExternalEventResponse } from '../../post';

export const getCommunityAdminEvents = async (communityID: string) => {
  const params = stringify({ communityID });
  const { data } = await makeRequest<{
    events: IPostCreateExternalEventResponse['event'][];
  }>('GET', `/api/communityAdmin/events?${params}`);

  return (data as unknown) as {
    successful: boolean;
    message: string;
    content: { events: IPostCreateExternalEventResponse['event'][] };
    status: number;
  };
};
