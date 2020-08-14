import { MessageType, ConversationType } from '../../helpers/types';

export const UPDATE_CONVERSATIONS = 'messages:updateConversations';
export const UPDATE_NEW_MESSAGE = 'messages:updateNewMessage';
export const RESET_NEW_MESSAGE = 'messages:resetNewMessage';

export function updateConversations(conversations: ConversationType[]) {
  return {
    type: UPDATE_CONVERSATIONS,
    payload: {
      conversations,
    },
  };
}

export function updateNewMessage(newMessage: MessageType) {
  return {
    type: UPDATE_NEW_MESSAGE,
    payload: { newMessage },
  };
}

export function resetNewMessage() {
  return {
    type: RESET_NEW_MESSAGE,
    payload: {},
  };
}
