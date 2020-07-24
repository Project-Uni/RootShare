import { MessageType, ConversationType } from '../../types/messagingTypes';
import { UPDATE_CONVERSATIONS, UPDATE_NEW_MESSAGE } from '../actions/message';

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

export function newMessageReducer(
  state = '',
  data: { type: string; payload: { newMessage: MessageType } }
) {
  const { type, payload } = data;
  switch (type) {
    case UPDATE_NEW_MESSAGE:
      return payload.newMessage;
    default:
      return state;
  }
}
