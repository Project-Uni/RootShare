import { Dispatch } from 'react';

import { resetUser } from './user';
import { updateAccessToken, updateRefreshToken } from './token';
import {
  updateConversations,
  updateCurrConversationID,
  resetNewMessage,
} from './message';
import { resetMessageSocket } from './sockets';

export * from './interactions';
export * from './message';
export * from './sockets';
export * from './token';
export * from './user';

export type ReduxAction = { type: string; payload?: { [k: string]: unknown } };

export const resetState = (dispatch: Dispatch<ReduxAction>) => {
  dispatch(resetUser());
  dispatch(updateAccessToken(''));
  dispatch(updateRefreshToken(''));
  dispatch(updateConversations([]));
  dispatch(updateCurrConversationID(''));
  dispatch(resetNewMessage());
  dispatch(resetMessageSocket());
};
