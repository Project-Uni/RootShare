import { Types } from 'mongoose';

import { getUserFromJWT, getQueryParams, sendPacket } from '../helpers/functions';
import { isAuthenticatedWithJWT } from '../passport/middleware/isAuthenticated';
import { uploadLinks } from '../interactions/external-links';

const ObjectIdVal = Types.ObjectId;

export default function externalLinkRoutes(app) {
  app.post('/api/links', isAuthenticatedWithJWT, async (req, res) => {
    try {
      const { _id: userID } = getUserFromJWT(req);

      const query = getQueryParams<{
        entityID: string;
        entityType: string;
        links: string[];
      }>(req, {
        entityID: { type: 'string' },
        entityType: { type: 'string' },
        links: { type: 'string[]' },
      });
      if (!query)
        return res.status(500).json(sendPacket(-1, 'Invalid query params'));
      const { entityID, entityType, links } = query;

      const packet = await uploadLinks(
        userID,
        ObjectIdVal(entityID),
        entityType,
        links
      );
      return res.json(packet);
    } catch (err) {
      res.json(sendPacket(-1, err.message));
    }
  });
}
