import { AccountType } from '../../helpers/types';
import { HoverProps } from '../../main-platform/reusable-components/components/HoverPreview';
import { SnackbarProps } from '../../main-platform/reusable-components/components/SnackbarNotification';
import { SidebarComponents } from '../../main-platform/RightSidebar/RightSidebar';
import {
  CommunityAdminPortalTab,
  COMMUNITY_ADMIN_PORTAL_TABS,
} from '../../main-platform/community/admin-portal/CommunityAdminPortalLeftSidebar';

export type RootshareReduxState = {
  user: {
    firstName: string;
    lastName: string;
    _id: string;
    email: string;
    privilegeLevel: number;
    accountType: string;
    university: string;
    profilePicture?: string;
    profilePictureLastUpdated?: number;
  };
  accessToken: string;
  refreshToken: string;
  messageSocket: { [k: string]: any };
  conversations: any[];
  currConversationID: string;
  newMessage: { [k: string]: any };
  hoverPreview: HoverProps & { mouseEntered?: boolean };
  snackbarNotification: SnackbarProps;
  sidebarComponents: SidebarComponents;
  registration: null | {
    email?: string;
    password?: string; //Password is encrypted
    initializationVector?: string; //Random bytes Used to decrypt the password
    phoneNumber?: string;
    accountType?: AccountType;
    verified?: boolean;
  };
  communityAdminPortalTab: CommunityAdminPortalTab;
};

export const initializeState = (): RootshareReduxState => ({
  user: {
    firstName: '',
    lastName: '',
    _id: '',
    email: '',
    privilegeLevel: 0,
    accountType: '',
    university: '',
  },
  accessToken: '',
  refreshToken: '',
  messageSocket: {},
  conversations: [],
  currConversationID: '',
  newMessage: {},
  hoverPreview: {
    _id: '',
    type: 'user',
    anchorEl: undefined,
    name: '',
  },
  snackbarNotification: {
    mode: null,
    message: '',
  },
  sidebarComponents: { names: [] },
  registration: null,
  communityAdminPortalTab: COMMUNITY_ADMIN_PORTAL_TABS[0],
});
