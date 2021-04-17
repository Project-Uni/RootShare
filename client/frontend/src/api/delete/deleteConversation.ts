import { makeRequest } from '../../helpers/functions';
import { stringify } from 'query-string';

export const deleteConversation = async (conversationID: string) => {
  const params = stringify({ conversationID });
  const { data } = await makeRequest(
    'DELETE',
    `/api/admin/messaging/conversation?${params}`
  );
  return data;
};
