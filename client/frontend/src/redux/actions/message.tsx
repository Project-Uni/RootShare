export const UPDATE_CONVERSATIONS = 'messages:updateConversations';
export const UPDATE_NEW_MESSAGE = 'messages:updateNewMessage';

export function updateConversations(conversations: any[]) {
  return {
    type: UPDATE_CONVERSATIONS,
    payload: {
      conversations,
    },
  };
}

export function updateNewMessage(newMessage: string) {
  return {
    type: UPDATE_NEW_MESSAGE,
    payload: { newMessage },
  };
}
