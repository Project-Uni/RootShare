import { log } from '../../helpers/functions';
import { HoverProps } from '../../main-platform/reusable-components/components/HoverPreview';
import { SnackbarProps } from '../../main-platform/reusable-components/components/SnackbarNotification';
const STATE_NAME = 'RootShare:state';

export type RootshareReduxState = {
  user: {
    firstName: string;
    lastName: string;
    _id: string;
    email: string;
    privilegeLevel: number;
    accountType: string;
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
};

export const initializeState = (): RootshareReduxState => ({
  user: {
    firstName: '',
    lastName: '',
    _id: '',
    email: '',
    privilegeLevel: 0,
    accountType: 'fan',
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
});

const saveState = (state: RootshareReduxState) => {
  try {
    let serializedState = JSON.stringify(state);
    localStorage.setItem(STATE_NAME, serializedState);
  } catch (err) {
    log('error', 'There was an unexpected error while trying to save state.');
  }
};

const loadState = (): RootshareReduxState => {
  try {
    let serializedState = localStorage.getItem(STATE_NAME);
    if (serializedState == null) {
      return initializeState();
    }
    return JSON.parse(serializedState) as RootshareReduxState;
  } catch (err) {
    log('error', 'There was an unexpected error while trying to load state');
    return initializeState();
  }
};

export { saveState, loadState };
