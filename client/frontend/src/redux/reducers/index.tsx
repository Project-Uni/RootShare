import { combineReducers } from 'redux';
import userReducer from './userReducer';
import { accessTokenReducer, refreshTokenReducer } from './tokenReducers';
import { messageSocketReducer } from './socketReducers';
import {
  conversationsReducer,
  currConversationIDReducer,
  newMessageReducer,
} from './messageReducers';
import {
  hoverPreviewReducer,
  snackbarNotificationReducer,
} from './interactionsReducers';
import { registrationReducer } from './registrationReducer';
import { sidebarComponentsReducer } from './sidebarReducers';
import { communityAdminReducers } from './communityAdminReducers';

const allReducers = combineReducers({
  user: userReducer,
  accessToken: accessTokenReducer,
  refreshToken: refreshTokenReducer,
  messageSocket: messageSocketReducer,
  conversations: conversationsReducer,
  currConversationID: currConversationIDReducer,
  newMessage: newMessageReducer,
  hoverPreview: hoverPreviewReducer,
  snackbarNotification: snackbarNotificationReducer,
  sidebarComponents: sidebarComponentsReducer,
  registration: registrationReducer,
  communityAdminPortalTab: communityAdminReducers,
});

export default allReducers;
