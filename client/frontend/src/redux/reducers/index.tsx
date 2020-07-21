import { combineReducers } from 'redux';
import userReducer from './userReducer';
import { accessTokenReducer, refreshTokenReducer } from './tokenReducers';
import { socketReducer } from './socketReducer';
import { conversationsReducer, newMessageReducer } from './messageReducers';

const allReducers = combineReducers({
  user: userReducer,
  accessToken: accessTokenReducer,
  refreshToken: refreshTokenReducer,
  socket: socketReducer,
  conversations: conversationsReducer,
  newMessage: newMessageReducer,
});

export default allReducers;
