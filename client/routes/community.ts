import { log, sendPacket } from '../helpers/functions';
import { USER_LEVEL } from '../helpers/types';

import { isAuthenticatedWithJWT } from '../passport/middleware/isAuthenticated';
import { isCommunityAdmin } from './middleware/communityAuthentication';

import {
  // Admin Routes
  createNewCommunity,
  retrieveAllCommunities,
  editCommunity,
  // General Community Actions
  getCommunityInformation,
  joinCommunity,
  getAllPendingMembers,
  rejectPendingMember,
  acceptPendingMember,
  leaveCommunity,
  cancelCommunityPendingRequest,
  getCommunityMembers,
  // Follow Related Actions
  followCommunity,
  acceptFollowRequest,
  rejectFollowRequest,
  cancelFollowRequest,
  unfollowCommunity,
  getAllFollowingCommunities,
  getAllFollowedByCommunities,
  getAllPendingFollowRequests,
  // Meet the Greeks
  greekInterestedToggle,
} from '../interactions/community';

export default function communityRoutes(app) {
  app.post(
    '/api/admin/community/create',
    isAuthenticatedWithJWT,
    async (req, res) => {
      if (req.user.privilegeLevel < USER_LEVEL.ADMIN)
        return res.json(
          sendPacket(-1, 'User is not authorized to perform this action')
        );

      const { name, description, adminID, type, isPrivate, isMTG } = req.body;
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
        isPrivate,
        { isMTG }
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

    const { _id, name, description, adminID, type, isPrivate, isMTG } = req.body;
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
      isPrivate,
      { isMTG }
    );

    return res.json(packet);
  });

  app.post('/api/community/create', isAuthenticatedWithJWT, async (req, res) => {
    const { name, description, type, isPrivate } = req.body;

    if (
      !name ||
      !description ||
      !type ||
      isPrivate === null ||
      isPrivate === undefined
    )
      return res.json(
        sendPacket(
          -1,
          'name, description, type, or isPrivate missing from request body.'
        )
      );

    const userID = req.user._id;
    const packet = await createNewCommunity(
      name,
      description,
      userID,
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
      const packet = await getCommunityInformation(communityID, req.user._id);
      return res.json(packet);
    }
  );

  app.post(
    '/api/community/:communityID/join',
    isAuthenticatedWithJWT,
    async (req, res) => {
      const { communityID } = req.params;
      const packet = await joinCommunity(communityID, req.user._id);
      return res.json(packet);
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

  app.post(
    '/api/community/:communityID/leave',
    isAuthenticatedWithJWT,
    async (req, res) => {
      const { communityID } = req.params;
      const userID = req.user._id;

      const packet = await leaveCommunity(communityID, userID);
      return res.json(packet);
    }
  );

  app.post(
    '/api/community/:communityID/cancelPending',
    isAuthenticatedWithJWT,
    async (req, res) => {
      const { communityID } = req.params;
      const userID = req.user._id;

      const packet = await cancelCommunityPendingRequest(communityID, userID);
      return res.json(packet);
    }
  );

  app.post(
    '/api/community/:communityID/follow',
    isAuthenticatedWithJWT,
    async (req, res) => {
      const { communityID } = req.params;
      const userID = req.user._id;
      const { followAsCommunityID } = req.body;
      if (!followAsCommunityID)
        return res.json(
          sendPacket(-1, 'followAsCommunityID missing from request body')
        );

      const packet = await followCommunity(communityID, followAsCommunityID, userID);
      return res.json(packet);
    }
  );

  app.post(
    '/api/community/:communityID/follow/accept',
    isAuthenticatedWithJWT,
    isCommunityAdmin,
    async (req, res) => {
      const { communityID } = req.params;
      const { edgeID } = req.body;

      if (!edgeID)
        return res.json(sendPacket(-1, 'edgeID missing from request body'));

      const packet = await acceptFollowRequest(communityID, edgeID);
      return res.json(packet);
    }
  );

  app.post(
    '/api/community/:communityID/follow/reject',
    isAuthenticatedWithJWT,
    isCommunityAdmin,
    async (req, res) => {
      const { communityID } = req.params;
      const { edgeID } = req.body;

      if (!edgeID)
        return res.json(sendPacket(-1, 'edgeID missing from request body'));

      const packet = await rejectFollowRequest(communityID, edgeID);
      return res.json(packet);
    }
  );

  app.post(
    '/api/community/:communityID/follow/cancel',
    isAuthenticatedWithJWT,
    async (req, res) => {
      const { communityID } = req.params;
      const userID = req.user._id;
      const { fromCommunityID } = req.body;

      if (!fromCommunityID)
        return res.json(sendPacket(-1, 'yourCommunityID missing from request body'));

      const packet = await cancelFollowRequest(fromCommunityID, communityID, userID);
      return res.json(packet);
    }
  );

  app.post(
    '/api/community/:communityID/unfollow',
    isAuthenticatedWithJWT,
    async (req, res) => {
      const { communityID } = req.params;
      const userID = req.user._id;
      const { fromCommunityID } = req.body;

      const packet = await unfollowCommunity(fromCommunityID, communityID, userID);
      return res.json(packet);
    }
  );

  app.get(
    '/api/community/:communityID/following',
    isAuthenticatedWithJWT,
    async (req, res) => {
      const { communityID } = req.params;
      const packet = await getAllFollowingCommunities(communityID);
      return res.json(packet);
    }
  );

  app.get(
    '/api/community/:communityID/followedBy',
    isAuthenticatedWithJWT,
    async (req, res) => {
      const { communityID } = req.params;
      const packet = await getAllFollowedByCommunities(communityID);
      return res.json(packet);
    }
  );

  app.get(
    '/api/community/:communityID/follow/pending',
    isAuthenticatedWithJWT,
    isCommunityAdmin,
    async (req, res) => {
      const { communityID } = req.params;
      const packet = await getAllPendingFollowRequests(communityID);
      return res.json(packet);
    }
  );

  app.get(
    '/api/community/:communityID/members',
    isAuthenticatedWithJWT,
    async (req, res) => {
      const { communityID } = req.params;
      const { _id: userID } = req.user;
      const { skipCalculation } = req.query;
      const packet = await getCommunityMembers(userID, communityID, {
        skipCalculation,
      });
      return res.json(packet);
    }
  );

  app.post(
    '/api/community/:communityID/greek/interested',
    isAuthenticatedWithJWT,
    async (req, res) => {
      const { communityID } = req.params;
      const userID = req.user._id;
      const { interested } = req.body;

      greekInterestedToggle(communityID, userID, interested, (packet) =>
        res.json(packet)
      );
    }
  );
}
