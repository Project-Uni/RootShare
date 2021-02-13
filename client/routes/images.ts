import { getUserFromJWT, sendPacket } from '../helpers/functions';

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
   *            name: userID
   *            schema:
   *              type: string
   *            description: The ID of the user whos profile and banner you are trying to retrieve
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
   *        responses:
   *          "1":
   *            description: Successfully retrieved profile picture / banner
   *          "-1":
   *            description: Failed to retrieve profile picture / banner
   *
   */

  app.get('/api/images/profile', isAuthenticatedWithJWT, async (req, res) => {
    let {
      getProfile,
      getBanner,
      userID,
    }: { getProfile: boolean; getBanner: boolean; userID: string } = req.query;

    if (userID === 'user') userID = getUserFromJWT(req)._id;

    const packet = await getUserProfileAndBanner(userID, {
      getProfile,
      getBanner,
    });
    return res.json(packet);
  });

  app.get(
    '/api/images/community/:communityID',
    isAuthenticatedWithJWT,
    async (req, res) => {
      const { communityID } = req.params;

      const packet = await getCommunityProfileAndBanner(communityID);
      return res.json(packet);
    }
  );
}
