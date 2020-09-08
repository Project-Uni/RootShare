import {
  log,
  sendPacket,
  uploadFile,
  retrieveFile,
  retrieveSignedUrl,
  decodeBase64Image,
} from '../helpers/functions';

import { isAuthenticatedWithJWT } from '../passport/middleware/isAuthenticated';
import { isCommunityAdmin } from './middleware/communityAuthentication';

import { User, Community } from '../models';

module.exports = (app) => {
  app.post(
    '/api/images/profile/updateProfilePicture',
    isAuthenticatedWithJWT,
    async (req, res) => {
      const { image } = req.body;
      if (!image) return res.json(sendPacket(-1, 'image not in request body'));

      const imageBuffer: { type?: string; data?: Buffer } = decodeBase64Image(image);
      if (!imageBuffer.data) return res.json(sendPacket(0, 'Invalid base64 image'));

      const success = await uploadFile(
        'profile',
        `${req.user._id}_profile.jpeg`,
        imageBuffer.data
      );
      if (!success) return res.json(sendPacket(0, 'Failed to upload image'));

      try {
        const user = await User.findById(req.user._id);
        user.profilePicture = `${req.user._id}_profile.jpeg`;
        user.save();
        log('info', 'Successfully updated user entry for profile picture');
      } catch (err) {
        log('error', err);
      }

      log(
        'info',
        `Updated profile picture for ${req.user.firstName + req.user.lastName}`
      );
      return res.json(sendPacket(1, 'Successfully uploaded image'));
    }
  );

  app.get(
    '/api/images/profile/:userID',
    isAuthenticatedWithJWT,
    async (req, res) => {
      const { userID } = req.params;
      let pictureFileName = ``;
      if (userID === 'user') pictureFileName = `${req.user._id}_profile.jpeg`;
      else pictureFileName = `${userID}_profile.jpeg`;

      try {
        const user = await User.findById(userID);
        if (user.profilePicture) pictureFileName = user.profilePicture;
      } catch (err) {
        log('err', err);
      }

      const imageURL = await retrieveSignedUrl('profile', pictureFileName);

      if (!imageURL) {
        return res.json(sendPacket(0, 'No profile image found for user'));
      }

      return res.json(
        sendPacket(1, 'Successfully retrieved profile image url', { imageURL })
      );
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

      const imageBuffer: { type?: string; data?: Buffer } = decodeBase64Image(image);
      if (!imageBuffer.data) return res.json(sendPacket(0, 'Invalid base64 image'));

      const success = await uploadFile(
        'communityProfile',
        `${communityID}_profile.jpeg`,
        imageBuffer.data
      );
      if (!success) return res.json(sendPacket(0, 'Failed to upload image'));

      Community.updateOne(
        { _id: communityID },
        { profilePicture: `${communityID}_profile.jpeg` }
      )
        .exec()
        .then(() => {
          log(
            'info',
            `Sucessfully community profile picture DB entry for ${communityID}`
          );
        })
        .catch((err) => {
          log('error', err);
        });

      return res.json(
        sendPacket(1, 'Successfully updated profile picture for community.')
      );
    }
  );

  app.get(
    '/api/images/community/:communityID',
    isAuthenticatedWithJWT,
    async (req, res) => {
      const { communityID } = req.params;
      let pictureFileName = `${communityID}_profile.jpeg`;

      try {
        const community = await Community.findById(communityID, ['profilePicture']);
        if (community.profilePicture) pictureFileName = community.profilePicture;
      } catch (err) {
        log('err', err);
      }

      const imageURL = await retrieveSignedUrl('communityProfile', pictureFileName);

      if (!imageURL) {
        return res.json(sendPacket(0, 'No profile image found for user'));
      }

      return res.json(
        sendPacket(1, 'Successfully retrieved profile image url', { imageURL })
      );
    }
  );
};
