import { sendPacket } from '../helpers/functions';

import { isAuthenticatedWithJWT } from '../passport/middleware/isAuthenticated';
import { isCommunityAdmin } from './middleware/communityAuthentication';

import {
  updateUserProfilePicture,
  updateUserBanner,
  updateCommunityProfilePicture,
  getUserProfileAndBanner,
  getCommunityProfileAndBanner,
} from '../interactions/images';

export default function imageRoutes(app) {
  app.post(
    '/api/images/profile/updateProfilePicture',
    isAuthenticatedWithJWT,
    async (req, res) => {
      const { image } = req.body;
      if (!image) return res.json(sendPacket(-1, 'image not in request body'));

      const packet = await updateUserProfilePicture(image, req.user._id);
      return res.json(packet);
    }
  );

  app.post(
    '/api/images/profile/banner',
    isAuthenticatedWithJWT,
    async (req, res) => {
      const { image } = req.body;
      if (!image) return res.json(sendPacket(-1, 'image not in request body'));

      const packet = await updateUserBanner(image, req.user._id);
      return res.json(packet);
    }
  );

  app.get(
    '/api/images/profile/:userID',
    isAuthenticatedWithJWT,
    async (req, res) => {
      let { userID } = req.params;

      let isCurrentUser = false;
      if (userID === 'user') {
        userID = req.user._id;
        isCurrentUser = true;
      }
      const packet = await getUserProfileAndBanner(userID, isCurrentUser);
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
