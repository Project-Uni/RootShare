import { MessageType, ConversationType } from '../../helpers/types/messagingTypes';

export const UPDATE_CONVERSATIONS = 'messages:updateConversations';
export const UPDATE_NEW_MESSAGE = 'messages:updateNewMessage';

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
