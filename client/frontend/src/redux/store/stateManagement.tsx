import { log } from '../../helpers/functions';
import { HoverProps } from '../../main-platform/reusable-components/components/HoverPreview';
import { SnackbarProps } from '../../main-platform/reusable-components/components/SnackbarNotification';
const STATE_NAME = 'RootShare:state';

export type RootshareReduxState = {
  user: { [k: string]: any };
  accessToken: string;
  refreshToken: string;
  messageSocket: { [k: string]: any };
  conversations: any[];
  currConversationID: string;
  newMessage: { [k: string]: any };
  hoverPreview: HoverProps;
  snackbarNotification: SnackbarProps;
};

const initializeState = () => ({
  user: {},
  accessToken: '',
  refreshToken: '',
  messageSocket: {},
  conversations: [],
  currConversationID: '',
  newMessage: {},
  hoverPreview: {},
  snackbarNotification: {},
});

const saveState = (state: { [key: string]: any }) => {
  try {
    let serializedState = JSON.stringify(state);
    localStorage.setItem(STATE_NAME, serializedState);
  } catch (err) {
    log('error', 'There was an unexpected error while trying to save state.');
  }
};

const loadState = () => {
  try {
    let serializedState = localStorage.getItem(STATE_NAME);
    if (serializedState == null) {
      return initializeState();
    }
    return JSON.parse(serializedState);
  } catch (err) {
    log('error', 'There was an unexpected error while trying to load state');
  }
};

export { saveState, loadState };
