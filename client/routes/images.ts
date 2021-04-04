import { Types } from 'mongoose';

import { getUserFromJWT, sendPacket, getQueryParams } from '../helpers/functions';
import { isAuthenticatedWithJWT } from '../passport/middleware/isAuthenticated';
import { isCommunityAdmin } from './middleware/communityAuthentication';

import {
  updateUserProfilePicture,
  updateUserBanner,
  updateCommunityProfilePicture,
  updateCommunityBanner,
  getUserProfileAndBanner,
  getCommunityProfileAndBanner,
} from '../interactions/images';

const ObjectIdVal = Types.ObjectId;

export default function imageRoutes(app) {
  app.post(
    '/api/images/profile/updateProfilePicture',
    isAuthenticatedWithJWT,
    async (req, res) => {
      const { image } = req.body;
      const { _id: userID } = getUserFromJWT(req);
      if (!image) return res.json(sendPacket(-1, 'image not in request body'));

      const packet = await updateUserProfilePicture(image, userID);
      return res.json(packet);
    }
  );

  app.post(
    '/api/images/profile/banner',
    isAuthenticatedWithJWT,
    async (req, res) => {
      const { image } = req.body;
      const { _id: userID } = getUserFromJWT(req);
      if (!image) return res.json(sendPacket(-1, 'image not in request body'));

      const packet = await updateUserBanner(image, userID);
      return res.json(packet);
    }
  );

  app.post(
    '/api/images/community/:communityID/updateProfilePicture',
    isAuthenticatedWithJWT,
    isCommunityAdmin,
    async (req, res) => {
      const { communityID } = req.params;

      const { image } = req.body;
      if (!image) return res.json(sendPacket(-1, 'image not in request body'));

      const packet = await updateCommunityProfilePicture(image, communityID);
      return res.json(packet);
    }
  );

  app.post(
    '/api/images/community/:communityID/banner',
    isAuthenticatedWithJWT,
    isCommunityAdmin,
    async (req, res) => {
      const { communityID } = req.params;
      const { image } = req.body;
      if (!image) return res.json(sendPacket(-1, 'image not in request body'));

      const packet = await updateCommunityBanner(image, communityID);
      return res.json(packet);
    }
  );

  /**
   *
   * @swagger
   * paths:
   *    /api/images/profile:
   *      get:
   *        summary: Retrieve profile and banner for a user
   *        tags:
   *          - Image
   *        parameters:
   *          - in: query
   *            name: _id
   *            schema:
   *              type: string
   *            description: The ID of the user or community whos profile and banner you are trying to retrieve
   *
   *          - in: query
   *            name: getProfile
   *            schema:
   *              type: boolean
   *            description: Option to retrieve profile picture (true if you want it)
   *
   *          - in: query
   *            name: getBanner
   *            schema:
   *              type: boolean
   *            description: Option to retrieve banner picture (true if you want it)
   *
   *          - in: query
   *            name: type
   *            schema:
   *               type: string
   *            description: Entity type to retrieve information of (community or user)
   *
   *        responses:
   *          "1":
   *            description: Successfully retrieved profile picture / banner
   *          "-1":
   *            description: Failed to retrieve profile picture / banner
   *
   */

  app.get('/api/images/profile', isAuthenticatedWithJWT, async (req, res) => {
    const query = getQueryParams<{
      _id: string;
      type: string;
      getBanner?: boolean;
      getProfile?: boolean;
    }>(req, {
      _id: { type: 'string' },
      type: { type: 'string' },
      getBanner: { type: 'boolean', optional: true },
      getProfile: { type: 'boolean', optional: true },
    });
    if (!query) return res.status(500).json(sendPacket(-1, 'Invalid query params'));

    let { getProfile, getBanner, _id, type } = query;

    let packet: {
      success: number;
      message: string;
      content: {
        [key: string]: any;
      };
    };

    let entityID = _id === 'user' ? getUserFromJWT(req)._id : ObjectIdVal(_id);
    if (type === 'user')
      packet = await getUserProfileAndBanner(entityID, {
        getProfile,
        getBanner,
      });
    else if (type === 'community')
      packet = await getCommunityProfileAndBanner(entityID, {
        getProfile,
        getBanner,
      });
    else packet = sendPacket(-1, 'Invalid type');

    return res.json(packet);
  });
}
