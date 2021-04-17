import { Conversation, Message } from '../../rootshare_db/models';
import { ObjectIdType } from '../../rootshare_db/types';
import { sendPacket } from '../../helpers/functions';

export const deleteConversation = async (conversationID: ObjectIdType) => {
  const conversationPromise = Conversation.model.deleteOne({
    _id: conversationID,
  });
  const messagesPromise = Message.model.deleteMany({
    conversationID,
  });

  return Promise.all([conversationPromise, messagesPromise]).then(
    ([conversationDelete, messagesDelete]) => {
      if (conversationDelete.deletedCount === 1 && messagesDelete.ok)
        return sendPacket(1, 'Deleted Conversation and Messages');
      else
        return sendPacket(
          1,
          'There was an error deleting Conversation or Messages',
          { conversationDelete, messagesDelete }
        );
    }
  );
};
