import sendPacket from '../helpers/sendPacket';
import log from '../helpers/logger';
import { isAuthenticatedWithJWT } from '../passport/middleware/isAuthenticated';
import { isCommunityAdmin } from './middleware/communityAuthentication';

import {
  createNewCommunity,
  retrieveAllCommunities,
  editCommunity,
  getCommunityInformation,
  joinCommunity,
  getAllPendingMembers,
  rejectPendingMember,
  acceptPendingMember,
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
    '/api/community/:communityID/info',
    isAuthenticatedWithJWT,
    async (req, res) => {
      const { communityID } = req.params;
      const packet = await getCommunityInformation(communityID);
      return res.json(packet);
    }
  );

  app.get(
    '/api/community/:communityID/updateStatus/:newStatus',
    isAuthenticatedWithJWT,
    async (req, res) => {
      const { communityID, newStatus } = req.params;
      if (newStatus === 'join') {
        const packet = await joinCommunity(communityID, req.user._id);
        return res.json(packet);
      }
    }
  );

  app.get(
    '/api/community/:communityID/pending',
    isAuthenticatedWithJWT,
    isCommunityAdmin,
    async (req, res) => {
      const { communityID } = req.params;
      const packet = await getAllPendingMembers(communityID);
      return res.json(packet);
    }
  );

  app.post(
    '/api/community/:communityID/rejectPending',
    isAuthenticatedWithJWT,
    isCommunityAdmin,
    async (req, res) => {
      const { communityID } = req.params;
      const { userID } = req.body;
      if (!userID)
        return res.json(sendPacket(-1, 'userID missing from request body'));

      const packet = await rejectPendingMember(communityID, userID);
      return res.json(packet);
    }
  );

  app.post(
    '/api/community/:communityID/acceptPending',
    isAuthenticatedWithJWT,
    isCommunityAdmin,
    async (req, res) => {
      const { communityID } = req.params;
      const { userID } = req.body;
      if (!userID)
        return res.json(sendPacket(-1, 'userID missing from request body'));

      const packet = await acceptPendingMember(communityID, userID);
      return res.json(packet);
    }
  );
}
