import sendPacket from '../helpers/sendPacket';
import log from '../helpers/logger';
import { isAuthenticatedWithJWT } from '../passport/middleware/isAuthenticated';

import {
  createNewCommunity,
  retrieveAllCommunities,
} from '../interactions/community';

import { USER_LEVEL } from '../types/types';

export default function communityRoutes(app) {
  app.post(
    '/api/admin/community/create',
    isAuthenticatedWithJWT,
    async (req, res) => {
      if (req.user.privilegeLevel < USER_LEVEL.ADMIN)
        return res.json(
          sendPacket(-1, 'User is not authorized to perform this action')
        );

      const { name, description, adminID, type, isPrivate } = req.body;
      if (
        !name ||
        !description ||
        !adminID ||
        !type ||
        isPrivate === null ||
        isPrivate === undefined
      )
        return res.json(
          sendPacket(
            -1,
            'name, description, adminID, type, or isPrivate missing from request body.'
          )
        );

      const data = await createNewCommunity(
        name,
        description,
        adminID,
        type,
        isPrivate
      );

      return res.json(data);
    }
  );

  app.get('/api/admin/communities', isAuthenticatedWithJWT, async (req, res) => {
    if (req.user.privilegeLevel < USER_LEVEL.ADMIN)
      return res.json(
        sendPacket(-1, 'User is not authorized to perform this action')
      );

    const packet = await retrieveAllCommunities();
    return res.json(packet);
  });
}
