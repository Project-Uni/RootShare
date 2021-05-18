import { stringify } from 'qs';
import { makeRequest } from '../../helpers/functions';

import { LeanUser } from '../../helpers/types';
import { CommunityAdminPortalTab } from '../../main-platform/community/admin-portal/CommunityAdminPortalLeftSidebar';

type MembersResponse = {
  admin: LeanUser;
  members: LeanUser[];
};

type EventsResponse = {
  // approvedRequests:
  // pendingRequests:
  // deniedRequests:
};

export const getCommunityAdminPortal = async (reason: CommunityAdminPortalTab) => {
  const query = stringify({ reason });

  const { data } = await makeRequest<MembersResponse | EventsResponse>(
    'GET',
    `/api/webinar/recent?${query}`
  );
  return data;
};
