import { Types } from 'mongoose';

import { User, Community, ExternalLink, Document } from '../rootshare_db/models';
import { S3FileType, ImageReason, DocumentReason } from '../rootshare_db/types';
import {
  log,
  sendPacket,
  uploadFile,
  retrieveSignedUrl,
  decodeBase64Image,
} from '../helpers/functions';
import { ALLOWED_FILE_TYPES } from '../helpers/constants';

type ObjectIdType = Types.ObjectId;

export async function updateUserProfilePicture(image: string, userID: ObjectIdType) {
  const imageBuffer: { type?: string; data?: Buffer } = decodeBase64Image(image);
  if (!imageBuffer.data) return sendPacket(0, 'Invalid base64 image');

  try {
    const success = await uploadFile(
      'images',
      'profile',
      `${userID}_profile.jpeg`,
      imageBuffer.data
    );
    if (!success) return sendPacket(0, 'Failed to upload image');

    const user = await User.model.findById(userID);
    user.profilePicture = `${userID}_profile.jpeg`;
    user.save();
    log('info', `Updated profile picture for ${user.firstName} ${user.lastName}`);
    return sendPacket(1, 'Successfully uploaded image');
  } catch (err) {
    log('error', err);
    return sendPacket(-1, 'There was an error updating the profile picture');
  }
}

export async function updateUserBanner(image: string, userID: ObjectIdType) {
  const imageBuffer: { type?: string; data?: Buffer } = decodeBase64Image(image);
  if (!imageBuffer.data) return sendPacket(0, 'Invalid base64 image');

  const fileName = `${userID}_banner.jpeg`;
  try {
    const success = await uploadFile(
      'images',
      'profileBanner',
      fileName,
      imageBuffer.data
    );
    if (!success) return sendPacket(0, 'Failed to upload image');

    await User.model.updateOne({ _id: userID }, { bannerPicture: fileName });
    log('info', `Updated banner for ${userID}`);
    return sendPacket(1, 'Successfully uploaded image');
  } catch (err) {
    log('error', err);
    return sendPacket(-1, 'Failed to update user model with picture');
  }
}

export async function updateCommunityProfilePicture(
  image: string,
  communityID: ObjectIdType
) {
  const imageBuffer: { type?: string; data?: Buffer } = decodeBase64Image(image);
  if (!imageBuffer.data) return sendPacket(0, 'Invalid base64 image');

  try {
    const success = await uploadFile(
      'images',
      'communityProfile',
      `${communityID}_profile.jpeg`,
      imageBuffer.data
    );
    if (!success) return sendPacket(0, 'Failed to upload image');

    Community.model
      .updateOne(
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
  } catch (err) {
    log('error', err);
    return sendPacket(-1, err);
  }

  return sendPacket(1, 'Successfully updated profile picture for community.');
}

export async function updateCommunityBanner(
  image: string,
  communityID: ObjectIdType
) {
  const imageBuffer: { type?: string; data?: Buffer } = decodeBase64Image(image);
  if (!imageBuffer.data) return sendPacket(0, 'Invalid base64 image');

  const fileName = `${communityID}_banner.jpeg`;
  try {
    const success = await uploadFile(
      'images',
      'communityBanner',
      fileName,
      imageBuffer.data
    );
    if (!success) return sendPacket(0, 'Failed to upload image');

    await Community.model.updateOne(
      { _id: communityID },
      { bannerPicture: fileName }
    );
    log('info', `Updated banner for ${communityID}`);
    return sendPacket(1, 'Successfully uploaded image');
  } catch (err) {
    log('error', err);
    return sendPacket(-1, 'Failed to update user model with picture');
  }
}

//GETTERS

export async function getUserProfileAndBanner(
  userID: ObjectIdType,
  options: { getProfile?: boolean; getBanner?: boolean }
) {
  try {
    const user = await User.model
      .findById(userID)
      .select('profilePicture bannerPicture')
      .exec();

    if (!user) return sendPacket(0, 'Could not find this user');

    const imagePromises = [];
    if (options.getProfile && user.profilePicture)
      imagePromises.push(
        retrieveSignedUrl('images', 'profile', user.profilePicture)
      );
    else imagePromises.push(null);

    if (options.getBanner && user.bannerPicture)
      imagePromises.push(
        retrieveSignedUrl('images', 'profileBanner', user.bannerPicture)
      );
    else imagePromises.push(null);

    return Promise.all(imagePromises).then(([profile, banner]) => {
      return sendPacket(1, 'Retrieved user profile and banner image', {
        profile,
        banner,
      });
    });
  } catch (err) {
    log('error', err);
    return sendPacket(-1, err);
  }
}

export async function getCommunityProfileAndBanner(
  communityID: ObjectIdType,
  options: { getProfile?: boolean; getBanner?: boolean }
) {
  try {
    const community = await Community.model
      .findById(communityID)
      .select('profilePicture bannerPicture');
    if (!community) return sendPacket(0, 'Could not find this community');

    const imagePromises = [];
    if (options.getProfile && community.profilePicture)
      imagePromises.push(
        retrieveSignedUrl('images', 'communityProfile', community.profilePicture)
      );
    else imagePromises.push(null);

    if (options.getBanner && community.bannerPicture)
      imagePromises.push(
        retrieveSignedUrl('images', 'communityBanner', community.bannerPicture)
      );
    else imagePromises.push(null);

    return Promise.all(imagePromises).then(([profile, banner]) => {
      return sendPacket(1, 'Retrieved community profile and banner image', {
        profile,
        banner,
      });
    });
  } catch (err) {
    log('error', err);
    return sendPacket(-1, err);
  }
}

export async function retrieveAllUrls(
  files: {
    fileType: S3FileType;
    reason: ImageReason | DocumentReason;
    fileName: string;
    entityID?: string;
    [key: string]: any;
  }[]
) {
  const urlPromises = [];
  files.forEach((image) => {
    urlPromises.push(
      retrieveSignedUrl(image.fileType, image.reason, image.fileName, image.entityID)
    );
  });

  return Promise.all(urlPromises).then((urls) => {
    for (let i = 0; i < urls.length; i++) files[i].url = urls[i];
    return files;
  });
}

export async function uploadLinks(
  userID: ObjectIdType,
  entityID: ObjectIdType,
  entityType: string,
  links: string[]
) {
  if (entityType !== 'user' && entityType !== 'community')
    return sendPacket(0, 'Invalid type');
  if (entityType === 'user' && !userID.equals(entityID))
    return sendPacket(0, `User ID doesn't match`);
  if (
    entityType === 'community' &&
    !(await Community.model.exists({ _id: entityID, admin: userID }))
  )
    return sendPacket(0, `Community doesn't exist or user is not admin`);

  const linkIDs = await ExternalLink.createLinks(entityID, entityType, links);

  if (entityType === 'user')
    await User.model.updateOne(
      { _id: userID },
      { $push: { links: { $each: linkIDs } } }
    );
  else
    await Community.model.updateOne(
      { _id: entityID },
      { $push: { links: { $each: linkIDs } } }
    );

  return sendPacket(1, `Added links to ${entityType}`);
}

export async function uploadDocuments(
  userID: ObjectIdType,
  entityID: ObjectIdType,
  entityType: string,
  documents: any[]
) {
  if (entityType !== 'user' && entityType !== 'community')
    return sendPacket(0, 'Invalid type');
  if (entityType === 'user' && !userID.equals(entityID))
    return sendPacket(0, `User ID doesn't match`);
  if (
    entityType === 'community' &&
    !(await Community.model.exists({ _id: entityID, admin: userID }))
  )
    return sendPacket(0, `Community doesn't exist or user is not admin`);

  documents = documents.filter((document) =>
    ALLOWED_FILE_TYPES.includes(document.mimetype)
  );

  if (documents.length === 0) return sendPacket(0, `No valid files to upload`);

  const uploadPromises = [];
  documents.forEach((document) => {
    uploadPromises.push(
      uploadFile(
        'documents',
        entityType,
        document.name,
        document.data,
        entityID.toString()
      )
    );
  });

  return Promise.all(uploadPromises).then(async (uploads) => {
    const uploadedDocs = [];
    for (let i = 0; i < uploads.length; i++)
      if (uploads[i])
        uploadedDocs.push({
          fileName: documents[i].name,
          mimeType: documents[i].mimetype,
        });

    if (uploadedDocs.length === 0)
      return sendPacket(-1, 'There was an error processing the files');

    const documentURLPromise = retrieveAllUrls(
      uploadedDocs.map((doc) => {
        return {
          fileType: 'documents',
          reason: entityType,
          fileName: doc.fileName,
          entityID: entityID.toString(),
        };
      })
    );
    const documentIDPromise = Document.createDocuments(
      entityID,
      entityType,
      uploadedDocs
    );

    return Promise.all([documentURLPromise, documentIDPromise]).then(
      async ([documentURLs, documentIDs]) => {
        if (entityType === 'user')
          await User.model.updateOne(
            { _id: userID },
            { $push: { documents: { $each: documentIDs } } }
          );
        else
          await Community.model.updateOne(
            { _id: entityID },
            { $push: { documents: { $each: documentIDs } } }
          );

        if (uploadedDocs.length < documents.length)
          return sendPacket(
            1,
            'There was an error processing some of the documents',
            {
              documents: documentURLs,
            }
          );
        return sendPacket(1, 'Uploaded all documents successfully', {
          documents: documentURLs,
        });
      }
    );
  });
}
