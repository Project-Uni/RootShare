import sendPacket from '../helpers/sendPacket';
import log from '../helpers/logger';
import { isAuthenticatedWithJWT } from '../passport/middleware/isAuthenticated';

import {
  createNewCommunity,
  retrieveAllCommunities,
  editCommunity,
  getCommunityInformation,
  joinCommunity,
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

      const packet = await createNewCommunity(
        name,
        description,
        adminID,
        type,
        isPrivate
      );

      return res.json(packet);
    }
  );

  app.get('/api/admin/community/all', isAuthenticatedWithJWT, async (req, res) => {
    if (req.user.privilegeLevel < USER_LEVEL.ADMIN)
      return res.json(
        sendPacket(-1, 'User is not authorized to perform this action')
      );

    const packet = await retrieveAllCommunities();
    return res.json(packet);
  });

  app.post('/api/admin/community/edit', isAuthenticatedWithJWT, async (req, res) => {
    if (req.user.privilegeLevel < USER_LEVEL.ADMIN)
      return res.json(
        sendPacket(-1, 'User is not authorized to perform this action')
      );

    const { _id, name, description, adminID, type, isPrivate } = req.body;
    if (
      !_id ||
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

    const packet = await editCommunity(
      _id,
      name,
      description,
      adminID,
      type,
      isPrivate
    );

    return res.json(packet);
  });

  app.get(
    '/api/community/:communityID',
    isAuthenticatedWithJWT,
    async (req, res) => {
      const { communityID } = req.params;
      const packet = await getCommunityInformation(communityID);
      return res.json(packet);
    }
  );

  app.get(
    '/api/community/:communityID/:newStatus',
    isAuthenticatedWithJWT,
    async (req, res) => {
      const { communityID, newStatus } = req.params;
      if (newStatus === 'join') {
        const packet = await joinCommunity(communityID, req.user._id);
        console.log('Packet:', packet);
        return res.json(packet);
      }
    }
  );
}
