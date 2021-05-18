import {
  CommunityAdminPortalTab,
  COMMUNITY_ADMIN_PORTAL_TABS,
} from '../../main-platform/community/admin-portal/CommunityAdminPortalLeftSidebar';

export const UPDATE_COMMUNITY_ADMIN_PORTAL_TAB = 'communityAdmin:updatePortalTab';
export const RESET_COMMUNITY_ADMIN_PORTAL_TAB = 'communityAdmin:resetPortalTab';

export function updateCommunityAdminPortalTab(tab: CommunityAdminPortalTab) {
  return {
    type: UPDATE_COMMUNITY_ADMIN_PORTAL_TAB,
    payload: {
      tab,
    },
  };
}

export function resetCommunityAdminPortalTab() {
  return {
    type: RESET_COMMUNITY_ADMIN_PORTAL_TAB,
    payload: { tab: COMMUNITY_ADMIN_PORTAL_TABS[0] },
  };
}
