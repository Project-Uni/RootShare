import { getUserFromJWT, sendPacket } from '../helpers/functions';
import { USER_LEVEL } from '../helpers/types';

import { isAuthenticatedWithJWT } from '../passport/middleware/isAuthenticated';
import { isCommunityAdmin } from './middleware/communityAuthentication';

import {
  // Admin Routes
  createNewCommunity,
  retrieveAllCommunities,
  editCommunity,
  deleteCommunity,
  //General Community Actions
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
  updateFields,
  //generics
  getCommunitiesGeneric,
} from '../interactions/community';
import { getQueryParams } from '../helpers/functions/getQueryParams';
import { stringify } from 'querystring';
import { send } from 'process';

/**
 *
 *  @swagger
 *  tags:
 *    name: Community
 *    description: API to manage Community Interactions
 *
 */

export default function communityRoutes(app) {
  app.post(
    '/api/admin/community/create',
    isAuthenticatedWithJWT,
    async (req, res) => {
      const { privilegeLevel } = getUserFromJWT(req);
      if (privilegeLevel < USER_LEVEL.ADMIN)
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
    const { privilegeLevel } = getUserFromJWT(req);
    if (privilegeLevel < USER_LEVEL.ADMIN)
      return res.json(
        sendPacket(-1, 'User is not authorized to perform this action')
      );

    const packet = await retrieveAllCommunities();
    return res.json(packet);
  });

  app.post('/api/admin/community/edit', isAuthenticatedWithJWT, async (req, res) => {
    const { privilegeLevel } = getUserFromJWT(req);
    if (privilegeLevel < USER_LEVEL.ADMIN)
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

  app.delete(
    '/api/admin/community/:communityID',
    isAuthenticatedWithJWT,
    async (req, res) => {
      const { privilegeLevel } = getUserFromJWT(req);
      if (privilegeLevel < USER_LEVEL.ADMIN)
        return res.json(
          sendPacket(-1, 'User is not authorized to perform this action')
        );

      const { communityID } = req.params;
      const packet = await deleteCommunity(communityID);
      return res.json(packet);
    }
  );

  app.delete(
    '/api/community/:communityID',
    isAuthenticatedWithJWT,
    isCommunityAdmin,
    async (req, res) => {
      const { communityID } = req.params;
      const packet = await deleteCommunity(communityID);
      return res.json(packet);
    }
  );

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

    const { _id: userID } = getUserFromJWT(req);
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
      const { _id } = getUserFromJWT(req);
      const packet = await getCommunityInformation(communityID, _id);
      return res.json(packet);
    }
  );

  app.post(
    '/api/community/:communityID/join',
    isAuthenticatedWithJWT,
    async (req, res) => {
      const { communityID } = req.params;
      const { _id } = getUserFromJWT(req);
      const packet = await joinCommunity(communityID, _id);
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
      const { _id } = getUserFromJWT(req);

      const packet = await leaveCommunity(communityID, _id);
      return res.json(packet);
    }
  );

  app.post(
    '/api/community/:communityID/cancelPending',
    isAuthenticatedWithJWT,
    async (req, res) => {
      const { communityID } = req.params;
      const { _id: userID } = getUserFromJWT(req);

      const packet = await cancelCommunityPendingRequest(communityID, userID);
      return res.json(packet);
    }
  );

  app.post(
    '/api/community/:communityID/follow',
    isAuthenticatedWithJWT,
    async (req, res) => {
      const { communityID } = req.params;
      const { _id: userID } = getUserFromJWT(req);
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
      const { _id: userID } = getUserFromJWT(req);
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
      const { _id: userID } = getUserFromJWT(req);
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
      const { _id: userID } = getUserFromJWT(req);

      const query = getQueryParams(req, {
        skipCalculation: {
          type: 'boolean',
          optional: true,
        },
      });
      if (!query)
        return res.status(500).json(sendPacket(-1, 'Invalid query params provided'));

      const { skipCalculation } = query;
      const packet = await getCommunityMembers(userID, communityID, {
        skipCalculation: (skipCalculation || false) as boolean,
      });
      return res.json(packet);
    }
  );

  /**
   *
   * @swagger
   * paths:
   *    /api/community/{communityID}/update:
   *      put:
   *        summary: Update basic fields for a community
   *        tags:
   *          - Community
   *        parameters:
   *          - in: path
   *            name: communityID
   *            schema:
   *              type: string
   *            required: true
   *            description: The ID of the community you are editing
   *
   *          - in: query
   *            name: description
   *            schema:
   *              type: string
   *            description: The new community description
   *
   *          - in: query
   *            name: name
   *            schema:
   *              type: string
   *            description: The new community name
   *
   *          - in: query
   *            name: private
   *            schema:
   *              type: boolean
   *            description: The new community privacy
   *
   *          - in: query
   *            name: type
   *            schema:
   *              type: string
   *            description: The new community type
   *
   *        responses:
   *          "1":
   *            description: Successfully updated community
   *          "-1":
   *            description: Failed to update community
   *
   */

  app.put(
    '/api/community/:communityID/update',
    isAuthenticatedWithJWT,
    isCommunityAdmin,
    async (req, res) => {
      const { communityID } = req.params;
      const query = getQueryParams(req, {
        description: { type: 'string', optional: true },
        name: { type: 'string', optional: true },
        type: { type: 'string', optional: true },
        private: { type: 'boolean', optional: true },
      });
      if (!query)
        return res.status(500).json(sendPacket(-1, 'Invalid query params'));
      const packet = await updateFields(communityID, query);
      return res.json(packet);
    }
  );

  app.get('/api/v2/community', isAuthenticatedWithJWT, async (req, res) => {
    const { _id: userID } = getUserFromJWT(req);
    const query = getQueryParams(req, {
      _ids: { type: 'string[]' },
      limit: { type: 'number', optional: true },
      fields: { type: 'string[]', optional: true },
      populates: { type: 'string[]', optional: true },
      getProfilePicture: { type: 'boolean', optional: true },
      getBannerPicture: { type: 'boolean', optional: true },
      includeDefaultFields: { type: 'boolean', optional: true },
      getRelationship: { type: 'boolean', optional: true },
    });

    if (!query) return res.status(500).json(sendPacket(-1, 'Invalid query params'));
    const {
      _ids,
      fields,
      getProfilePicture,
      getBannerPicture,
      getRelationship,
      limit,
      includeDefaultFields,
      populates: populatesRaw,
    } = query;

    const populates = [];
    try {
      (populatesRaw as string[]).forEach((populateRaw) => {
        const split = populateRaw.split(':');
        populates.push({ path: split[0], select: split[1] });
      });
    } catch (err) {
      return res.status(500).json(sendPacket(-1, 'Invalid query params'));
    }

    const options = {
      limit,
      populates,
      getProfilePicture,
      getBannerPicture,
      getRelationship: getRelationship ? userID : undefined,
      includeDefaultFields,
    };

    const packet = await getCommunitiesGeneric(_ids as string[], {
      fields: fields as any,
      options: options as any,
    });
    return res.json(packet);
  });

  /**
   *
   * @swagger
   * paths:
   *   /api/v2/community/relationship:
   *      put:
   *        summary: Update relationship between user and a community
   *        tags:
   *          - Community
   *        parameters:
   *          - in: query
   *            name: communityID
   *            schema:
   *              type: string
   *            description: The id of the community to update relationship to
   *
   *          - in: query
   *            name: action
   *            schema:
   *              type: string
   *            description: Value is join, cancel, or leave
   *
   *        responses:
   *          "1":
   *            description: Successfully updated community relationship
   *          "0":
   *            description: User input based error
   *          "-1":
   *            description: Internal error
   *
   */

  app.put(
    '/api/v2/community/relationship',
    isAuthenticatedWithJWT,
    async (req, res) => {
      const { _id: userID } = getUserFromJWT(req);
      const query = getQueryParams(req, {
        action: { type: 'string' },
        communityID: { type: 'string' },
      });
      if (!query)
        return res.status(500).json(sendPacket(-1, 'Invalid query params'));

      let { action, communityID } = query;
      (action = action as string), (communityID = communityID as string);

      if (action === 'join') res.json(await joinCommunity(communityID, userID));
      else if (action === 'leave')
        res.json(await leaveCommunity(communityID, userID));
      else if (action === 'cancel')
        res.json(await cancelCommunityPendingRequest(communityID, userID));
      else res.json(sendPacket(0, 'Invalid action provided'));
    }
  );
}
