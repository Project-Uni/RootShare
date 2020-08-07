import AWS = require('aws-sdk');

const AWSKeys = require('../../keys/aws_key.json');
const fs = require('fs');

import log from '../helpers/logger';
import sendPacket from '../helpers/sendPacket';

const s3 = new AWS.S3({
  accessKeyId: AWSKeys.accessKeyId,
  secretAccessKey: AWSKeys.secretAccessKey,
  apiVersion: '2006-03-01',
});

const BUCKET = 'rootshare-profile-images';

type ImageReason =
  | 'profile'
  | 'profileBanner'
  | 'communityProfile'
  | 'communityBanner'
  | 'eventBanner';

module.exports = (app) => {
  app.get('/test/upload', async (req, res) => {
    fs.readFile('./frontend/src/images/team/ashwin.jpeg', async (err, data) => {
      if (err) {
        log('error', err);
        return res.json(sendPacket(0, 'Error uploading', { err: err }));
      }
      const success = await uploadFile('profile', 'ashwin.jpeg', data);

      if (!success) {
        return res.json(sendPacket(0, 'Failed to upload image'));
      }
      return res.json(sendPacket(1, 'Successfully uploaded image'));
    });
  });
};

async function uploadFile(reason: ImageReason, fileName: string, file: any) {
  const prefix = getPathPrefix(reason);
  if (!prefix) return false;

  const params = {
    Bucket: BUCKET,
    Key: prefix + fileName,
    Body: file,
  };

  try {
    const data = await s3.upload(params).promise();
    log('info', `Successfully uploaded: ${data.Location}`);
    return true;
  } catch (err) {
    log('error', err.message);
    return false;
  }
}

function getPathPrefix(imageType: ImageReason) {
  let base = '/images/';
  switch (imageType) {
    case 'profile':
      return base + 'user/profile/';
    case 'profileBanner':
      return base + 'user/banner/';
    case 'communityProfile':
      return base + 'community/profile/';
    case 'communityBanner':
      return base + 'community/banner/';
    case 'eventBanner':
      return base + 'event/banner/';
    default:
      return null;
  }
}
