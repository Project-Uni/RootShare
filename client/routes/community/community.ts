import { ObjectIdVal, ObjectIdType } from '../../rootshare_db/types';
import {
  getUserFromJWT,
  sendPacket,
  getQueryParams,
  log,
} from '../../helpers/functions';
import { isAuthenticatedWithJWT } from '../../passport/middleware/isAuthenticated';
import {
  isCommunityAdmin,
  isCommunityAdminFromQueryParams,
  isCommunityMemberFromQueryParams,
} from '../middleware/communityAuthentication';

import {
  //General Community Actions
  createNewCommunity,
  getCommunityInformation,
  joinCommunity,
  leaveCommunity,
  cancelCommunityPendingRequest,
  getCommunityMembers,
  getCommunityMedia,
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
  pinPost,
  getPinnedPosts,
  inviteUser,
} from '../../interactions/community/community';

/**
 *
 *  @swagger
 *  tags:
 *    name: Community
 *    description: API to manage Community Interactions
 *
 */

export default function communityRoutes(app) {
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

  app.get('/api/community/info', isAuthenticatedWithJWT, async (req, res) => {
    try {
      const { _id: userID } = getUserFromJWT(req);
      const query = getQueryParams<{ communityID: string }>(req, {
        communityID: { type: 'string' },
      });
      if (!query)
        return res.status(500).json(sendPacket(-1, 'Invalid query params'));

      const { communityID } = query;
      const packet = await getCommunityInformation(ObjectIdVal(communityID), userID);

      res.json(packet);
    } catch (err) {
      log('err', err);
      res.json(sendPacket(-1, err.message));
    }
  });

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

      const query = getQueryParams<{
        skipCalculation?: boolean;
      }>(req, {
        skipCalculation: {
          type: 'boolean',
          optional: true,
        },
      });
      if (!query)
        return res.status(500).json(sendPacket(-1, 'Invalid query params provided'));

      const { skipCalculation } = query;
      const packet = await getCommunityMembers(userID, communityID, {
        skipCalculation,
      });
      return res.json(packet);
    }
  );

  app.get(
    '/api/community/:communityID/media',
    isAuthenticatedWithJWT,
    async (req, res) => {
      const { communityID } = req.params;
      const { _id: userID, accountType } = getUserFromJWT(req);

      const packet = await getCommunityMedia(userID, accountType, communityID);
      res.json(packet);
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
      const query = getQueryParams<{
        description?: string;
        bio?: string;
        name?: string;
        type?: string;
        private?: boolean;
      }>(req, {
        description: { type: 'string', optional: true },
        bio: { type: 'string', optional: true },
        name: { type: 'string', optional: true },
        type: { type: 'string', optional: true },
        private: { type: 'boolean', optional: true },
      });

      if (!query)
        return res.status(500).json(sendPacket(-1, 'Invalid query params'));
      const packet = await updateFields(ObjectIdVal(communityID), query);
      return res.json(packet);
    }
  );

  app.get('/api/v2/community', isAuthenticatedWithJWT, async (req, res) => {
    const { _id: userID } = getUserFromJWT(req);
    const query = getQueryParams<{
      _ids: string[];
      limit?: number;
      fields?: string[];
      populates?: string[];
      getProfilePicture?: boolean;
      getBannerPicture?: boolean;
      includeDefaultFields?: boolean;
      getRelationship?: boolean;
    }>(req, {
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
    if (populatesRaw)
      try {
        populatesRaw.forEach((populateRaw) => {
          const split = populateRaw.split(':');
          let mainPopulateAction: any = {};
          let nextPopulateAction = mainPopulateAction;
          for (let i = 0; i < split.length - 1; i += 2) {
            if (i !== 0) {
              nextPopulateAction.populate = {};
              nextPopulateAction = nextPopulateAction.populate;
            }
            nextPopulateAction.path = split[i];
            nextPopulateAction.select = split[i + 1];
          }
          populates.push(mainPopulateAction);
        });
      } catch (err) {
        log('err', err);
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

    const packet = await getCommunitiesGeneric(
      (_ids as unknown[]) as ObjectIdType[],
      {
        fields: fields as any,
        options: options as any,
      }
    );
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
      const query = getQueryParams<{
        action: string;
        communityID: string;
      }>(req, {
        action: { type: 'string' },
        communityID: { type: 'string' },
      });
      if (!query)
        return res.status(500).json(sendPacket(-1, 'Invalid query params'));

      let { action, communityID } = query;

      if (action === 'join')
        res.json(await joinCommunity(ObjectIdVal(communityID), userID));
      else if (action === 'leave')
        res.json(await leaveCommunity(ObjectIdVal(communityID), userID));
      else if (action === 'cancel')
        res.json(
          await cancelCommunityPendingRequest(ObjectIdVal(communityID), userID)
        );
      else res.json(sendPacket(0, 'Invalid action provided'));
    }
  );

  /**
   *
   * @swagger
   * paths:
   *   /api/v2/community/pin:
   *      put:
   *        summary: Pin or unpin a post to a community
   *        tags:
   *          - Community
   *        parameters:
   *          - in: query
   *            name: communityID
   *            schema:
   *              type: string
   *            description: The id of the community to pin post
   *
   *          - in: query
   *            name: postID
   *            schema:
   *              type: string
   *            description: Id of the post to pin
   *
   *        responses:
   *          "200":
   *            description: Successfully pinned / unpinned post
   *          "500":
   *            description: There was an error pinning the post
   *
   */

  app.put(
    '/api/v2/community/pin',
    isAuthenticatedWithJWT,
    isCommunityAdminFromQueryParams,
    async (req, res) => {
      const query = getQueryParams<{ postID: string; communityID: string }>(req, {
        communityID: { type: 'string' },
        postID: { type: 'string' },
      });

      if (!query)
        res
          .status(500)
          .json(sendPacket(-1, 'Missing query params communityID or postID'));
      else {
        let { postID, communityID } = query;

        const packet = await pinPost({
          postID: ObjectIdVal(postID),
          communityID: ObjectIdVal(communityID),
        });
        const status = packet.success === 1 ? 200 : 500;
        res.status(status).json(packet);
      }
    }
  );

  app.get(
    '/api/v2/community/pinnedPosts',
    isAuthenticatedWithJWT,
    isCommunityMemberFromQueryParams,
    async (req, res) => {
      const { _id: userID } = getUserFromJWT(req);
      const query = getQueryParams<{ communityID: string }>(req, {
        communityID: { type: 'string' },
      });

      if (!query)
        res.status(500).json(sendPacket(-1, 'Missing query param: communityID'));
      else {
        let { communityID } = query;
        communityID = communityID as string;
        const packet = await getPinnedPosts({
          communityID: ObjectIdVal(communityID),
          userID,
        });
        const status = packet.success === 1 ? 200 : 500;
        res.status(status).json(packet);
      }
    }
  );
  //TODO - Add in new is communityMember check from pinned-post branch
  app.put('/api/v2/community/invite', isAuthenticatedWithJWT, async (req, res) => {
    const { _id: userID } = getUserFromJWT(req);
    const {
      invitedIDs,
      communityID,
    }: { invitedIDs: string[]; communityID: string } = req.body;

    if (!invitedIDs || !Array.isArray(invitedIDs) || !communityID)
      res
        .status(500)
        .json(
          sendPacket(
            -1,
            'Missing body params: invitedIDs:string[] or communityID: string'
          )
        );
    else {
      const packet = await inviteUser({
        communityID,
        invitedIDs,
        fromUserID: userID.toString(),
      });
      const status = (() => {
        switch (packet.success) {
          case 1:
            return 200;
          case 0:
            return 400;
          case -1:
          default:
            return 500;
        }
      })();
      res.status(status).json(packet);
    }
  });
}
