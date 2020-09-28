import { combineReducers } from 'redux';
import userReducer from './userReducer';
import { accessTokenReducer, refreshTokenReducer } from './tokenReducers';
import { messageSocketReducer } from './socketReducers';
import {
  conversationsReducer,
  currConversationIDReducer,
  newMessageReducer,
} from './messageReducers';

const allReducers = combineReducers({
  user: userReducer,
  accessToken: accessTokenReducer,
  refreshToken: refreshTokenReducer,
  messageSocket: messageSocketReducer,
  conversations: conversationsReducer,
  currConversationID: currConversationIDReducer,
  newMessage: newMessageReducer,
});

export default allReducers;
