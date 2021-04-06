import AWS = require('aws-sdk');

const AWSKeys = require('../../../keys/aws_key.json');

import { log } from './logger';

import { S3FileType, ImageReason, DocumentReason } from '../../rootshare_db/types';

const s3 = new AWS.S3({
  accessKeyId: AWSKeys.accessKeyId,
  secretAccessKey: AWSKeys.secretAccessKey,
  apiVersion: '2006-03-01',
  signatureVersion: 'v4',
});

const BUCKET = 'rootshare-platform-files';

export async function uploadFile(
  fileType: S3FileType,
  reason: ImageReason | DocumentReason,
  fileName: string,
  file: any,
  entityID?: string
) {
  const prefix = getPathPrefix(fileType, reason, entityID);
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

export async function deleteFile(
  fileType: S3FileType,
  reason: ImageReason,
  fileName: string,
  entityID?: string
) {
  const prefix = getPathPrefix(fileType, reason, entityID);
  if (!prefix) return false;

  const params = { Bucket: BUCKET, Key: prefix + fileName };
  try {
    const data = await s3.deleteObject(params).promise();
    log('info', `Successfully deleted image: ${prefix + fileName}`);
    return true;
  } catch (err) {
    log('error', err.message);
    return false;
  }
}

export async function retrieveFile(
  fileType: S3FileType,
  reason: ImageReason,
  fileName: string,
  entityID?: string
) {
  const prefix = getPathPrefix(fileType, reason, entityID);
  if (!prefix) return false;

  const params = { Bucket: BUCKET, Key: prefix + fileName };
  try {
    const data = await s3.getObject(params).promise();
    log('info', `Successfully retrieved: ${prefix + fileName}`);
    return data;
  } catch (err) {
    log('error', err.message);
    return false;
  }
}

export async function retrieveSignedUrl(
  fileType: S3FileType,
  reason: ImageReason,
  fileName: string,
  entityID?: string
) {
  const prefix = getPathPrefix(fileType, reason, entityID);
  if (!prefix) return false;

  const headParams = {
    Bucket: BUCKET,
    Key: prefix + fileName,
  };
  const params = {
    Bucket: BUCKET,
    Key: prefix + fileName,
    Expires: 60 * 60 * 24,
  }; //Expires in 24 hours
  try {
    const head = await s3.headObject(headParams).promise();
    const signedURL = await s3.getSignedUrlPromise('getObject', params);

    return signedURL;
  } catch (err) {
    log('err', err);
    return false;
  }
}

function getPathPrefix(
  fileType: S3FileType,
  reason: ImageReason | DocumentReason,
  entityID?: string
) {
  const base = `${fileType}/`;
  if (fileType === 'images')
    switch (reason) {
      case 'profile':
        return base + 'user/profile/';
      case 'profileBanner':
        return base + 'user/banner/';
      case 'communityProfile':
        return base + 'community/profile/';
      case 'communityBanner':
        return base + 'community/banner/';
      case 'eventImage':
        return base + 'event/image/';
      case 'eventBanner':
        return base + 'event/banner/';
      case 'postImage':
        return base + 'post/';
      case 'mtgBanner':
        return base + 'mtg/banner/';
      default:
        return null;
    }
  else if (fileType === 'documents' && entityID)
    return `${base}${reason}/${entityID}/`;
}

export function decodeBase64Image(dataString: string) {
  const matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  const output: { type?: string; data?: Buffer } = {};

  if (matches.length !== 3) return {};

  output.type = matches[1];
  output.data = Buffer.from(matches[2], 'base64');

  return output;
}
