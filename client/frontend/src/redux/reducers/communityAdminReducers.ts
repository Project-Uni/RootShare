import {
  CommunityAdminPortalTab,
  COMMUNITY_ADMIN_PORTAL_TABS,
} from '../../main-platform/community/admin-portal/CommunityAdminPortalLeftSidebar';

import {
  UPDATE_COMMUNITY_ADMIN_PORTAL_TAB,
  RESET_COMMUNITY_ADMIN_PORTAL_TAB,
} from '../actions/communityAdmin';

export function communityAdminReducers(
  state: CommunityAdminPortalTab = COMMUNITY_ADMIN_PORTAL_TABS[0],
  data: {
    type: string;
    payload: {
      tab: CommunityAdminPortalTab;
    };
  }
): CommunityAdminPortalTab {
  const { type, payload } = data;

  switch (type) {
    case UPDATE_COMMUNITY_ADMIN_PORTAL_TAB:
      return payload.tab;
    case RESET_COMMUNITY_ADMIN_PORTAL_TAB:
      return payload.tab;
    default:
      return state;
  }
}
