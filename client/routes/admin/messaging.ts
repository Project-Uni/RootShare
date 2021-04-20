import { ObjectIdVal } from '../../rootshare_db/types';
import { getQueryParams, sendPacket } from '../../helpers/functions';
import { deleteConversation } from '../../interactions/admin';
import { isAuthenticatedWithJWT, isRootshareAdmin } from '.';

export default function adminMessagingRoutes(app) {
  app.delete(
    '/api/admin/messaging/conversation',
    isAuthenticatedWithJWT,
    isRootshareAdmin,
    async (req, res) => {
      const query = getQueryParams<{ conversationID: string }>(req, {
        conversationID: { type: 'string' },
      });
      if (!query)
        return res.status(500).json(sendPacket(-1, 'Invalid query params provided'));
      const { conversationID } = query;

      const packet = await deleteConversation(ObjectIdVal(conversationID));
      res.json(packet);
    }
  );
}
