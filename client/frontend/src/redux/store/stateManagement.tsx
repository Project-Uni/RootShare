import { log } from '../../helpers/functions';
const STATE_NAME = 'RootShare:state';

const initializeState = () => ({
  user: {},
  accessToken: '',
  refreshToken: '',
  messageSocket: {},
  conversations: [],
  currConversationID: '',
  newMessage: {},
  hoverPreview: {},
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
