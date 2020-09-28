import { MessageType, ConversationType } from '../../helpers/types';
import {
  UPDATE_CONVERSATIONS,
  UPDATE_CURR_CONVERSATION_ID,
  UPDATE_NEW_MESSAGE,
  RESET_NEW_MESSAGE,
} from '../actions/message';

export function conversationsReducer(
  state = [],
  data: { type: string; payload: { conversations: ConversationType[] } }
) {
  const { type, payload } = data;
  switch (type) {
    case UPDATE_CONVERSATIONS:
      return payload.conversations;
    default:
      return state;
  }
}

export function currConversationIDReducer(
  state = '',
  data: { type: string; payload: { currConversationID: string } }
) {
  const { type, payload } = data;
  switch (type) {
    case UPDATE_CURR_CONVERSATION_ID:
      return payload.currConversationID!;
    default:
      return state;
  }
}

export function newMessageReducer(
  state = '',
  data: { type: string; payload: { newMessage?: MessageType } }
) {
  const { type, payload } = data;
  switch (type) {
    case UPDATE_NEW_MESSAGE:
      return payload.newMessage!;
    case RESET_NEW_MESSAGE:
      return payload;
    default:
      return state;
  }
}
