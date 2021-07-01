import { stringify } from 'qs';
import { makeRequest } from '../../../helpers/functions';

type EventsResponse = {
  // approvedRequests:
  // pendingRequests:
  // deniedRequests:
};

export const getCommunityAdminEvents = async (communityID: string) => {
  const { data } = await makeRequest<EventsResponse>(
    'GET',
    `/api/community/${communityID}/admin/portal/events`
  );
  return data;
};
