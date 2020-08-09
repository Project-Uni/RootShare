const fs = require('fs');

import log from '../helpers/logger';
import sendPacket from '../helpers/sendPacket';

import {
  uploadFile,
  retrieveFile,
  retrieveSignedUrl,
  decodeBase64Image,
} from '../helpers/S3';
import { isAuthenticatedWithJWT } from '../passport/middleware/isAuthenticated';

import { User } from '../models';

module.exports = (app) => {
  app.get('/test/upload', async (req, res) => {
    fs.readFile('./frontend/src/images/team/smit.jpeg', async (err, data) => {
      if (err) {
        log('error', err);
        return res.json(sendPacket(0, 'Error uploading', { err: err }));
      }
      const success = await uploadFile('profile', 'smit.jpeg', data);

      if (!success) {
        return res.json(sendPacket(0, 'Failed to upload image'));
      }
      return res.json(sendPacket(1, 'Successfully uploaded image'));
    });
  });

  app.get('/test/retrieve', async (req, res) => {
    const data = await retrieveFile('profile', 'smit.jpeg');
    if (!data) {
      return res.json(sendPacket(0, 'Failed to retrieve image'));
    }
    res.writeHead(200, { 'Content-Type': 'image/jpeg' });
    res.write(data.Body, 'binary');
    return res.end(null, 'binary');
  });

  app.post(
    '/api/profile/updateProfilePicture',
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

  app.get('/api/getProfilePicture/:userID', async (req, res) => {
    const { userID } = req.params;
    let pictureFileName = `${req.user._id}_profile.jpeg`;

    try {
      const user = await User.findById(userID);
      if (user.profilePicture) pictureFileName = user.profilePicture;
    } catch (err) {
      log('err', err);
    }

    const imageURL = await retrieveSignedUrl('profile', pictureFileName);
    console.log('imageURL', imageURL);

    if (!imageURL) {
      return res.json(sendPacket(0, 'No profile image found for user'));
    }

    return res.json(
      sendPacket(1, 'Successfully retrieved profile image url', { imageURL })
    );
  });
};
