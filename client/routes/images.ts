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

      try {
        const success = await uploadFile(
          'profile',
          `${req.user._id}_profile.jpeg`,
          imageBuffer.data
        );
        if (!success) return res.json(sendPacket(0, 'Failed to upload image'));

        const user = await User.findById(req.user._id);
        user.profilePicture = `${req.user._id}_profile.jpeg`;
        user.save();
        log('info', 'Successfully updated user entry for profile picture');
      } catch (err) {
        log('error', err);
      }

      log(
        'info',
        `Updated profile picture for ${req.user.firstName} ${req.user.lastName}`
      );
      return res.json(sendPacket(1, 'Successfully uploaded image'));
    }
  );

  app.post(
    '/api/images/profile/banner',
    isAuthenticatedWithJWT,
    async (req, res) => {
      const { image } = req.body;
      if (!image) return res.json(sendPacket(-1, 'image not in request body'));

      const imageBuffer: { type?: string; data?: Buffer } = decodeBase64Image(image);
      if (!imageBuffer.data) return res.json(sendPacket(0, 'Invalid base64 image'));

      const fileName = `${req.user._id}_banner.jpeg`;
      try {
        const success = await uploadFile(
          'profileBanner',
          fileName,
          imageBuffer.data
        );
        if (!success) return res.json(sendPacket(0, 'Failed to upload image'));

        await User.updateOne({ _id: req.user._id }, { bannerPicture: fileName });
        log(
          'info',
          `Updated profile picture for ${req.user.firstName} ${req.user.lastName}`
        );
        return res.json(sendPacket(1, 'Successfully uploaded image'));
      } catch (err) {
        log('error', err);
        return res.json(sendPacket(-1, 'Failed to update user model with picture'));
      }
    }
  );

  app.get(
    '/api/images/profile/:userID',
    isAuthenticatedWithJWT,
    async (req, res) => {
      let { userID } = req.params;

      if (userID === 'user') userID = req.user._id;
      try {
        const user = await User.findById(userID)
          .select('profilePicture bannerPicture')
          .exec();

        if (!user) return res.json(sendPacket(0, 'Could not find this user'));

        const imagePromises = [];
        if (req.params.userID !== 'user' && user.profilePicture)
          imagePromises.push(retrieveSignedUrl('profile', user.profilePicture));
        else imagePromises.push(null);

        if (user.bannerPicture)
          imagePromises.push(retrieveSignedUrl('profileBanner', user.bannerPicture));
        else imagePromises.push(null);

        return Promise.all(imagePromises).then(([profile, banner]) => {
          return res.json(
            sendPacket(1, 'Retrieved user profile and banner image', {
              profile,
              banner,
            })
          );
        });
      } catch (err) {
        log('error', err);
        return res.json(sendPacket(-1, err));
      }
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
