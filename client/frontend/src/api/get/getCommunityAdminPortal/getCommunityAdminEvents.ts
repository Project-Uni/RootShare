import { stringify } from 'qs';
import { makeRequest } from '../../../helpers/functions';
import { ExternalEventDefault } from '../../../helpers/types';

export const getCommunityAdminEvents = async (communityID: string) => {
  const params = stringify({ communityID });
  const { data } = await makeRequest<{
    events: ExternalEventDefault[];
  }>('GET', `/api/communityAdmin/events?${params}`);

  return (data as unknown) as {
    successful: boolean;
    message: string;
    content: { events: ExternalEventDefault[] };
    status: number;
  };
};
