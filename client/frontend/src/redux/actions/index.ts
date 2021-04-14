import { Dispatch as ReactDispatch } from 'react';

import { resetUser } from './user';
import { updateAccessToken, updateRefreshToken } from './token';
import {
  updateConversations,
  updateCurrConversationID,
  resetNewMessage,
} from './message';
import { resetMessageSocket } from './sockets';
import { resetSidebarComponents } from './sidebar';

export * from './interactions';
export * from './message';
export * from './sockets';
export * from './token';
export * from './user';
export * from './registration';
export * from './sidebar';

export type ReduxAction = { type: string; payload?: { [k: string]: unknown } };
export type Dispatch = ReactDispatch<ReduxAction>;

export const resetState = (dispatch: Dispatch) => {
  dispatch(resetUser());
  dispatch(updateAccessToken(''));
  dispatch(updateRefreshToken(''));
  dispatch(updateConversations([]));
  dispatch(updateCurrConversationID(''));
  dispatch(resetNewMessage());
  dispatch(resetMessageSocket());
  dispatch(resetSidebarComponents());
};
