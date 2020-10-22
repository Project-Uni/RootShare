import {
  log,
  sendPacket,
  uploadFile,
  retrieveFile,
  retrieveSignedUrl,
  decodeBase64Image,
} from '../helpers/functions';
import { User, Community } from '../models';

export async function updateUserProfilePicture(image: string, userID: string) {
  const imageBuffer: { type?: string; data?: Buffer } = decodeBase64Image(image);
  if (!imageBuffer.data) return sendPacket(0, 'Invalid base64 image');

  try {
    const success = await uploadFile(
      'profile',
      `${userID}_profile.jpeg`,
      imageBuffer.data
    );
    if (!success) return sendPacket(0, 'Failed to upload image');

    const user = await User.findById(userID);
    user.profilePicture = `${userID}_profile.jpeg`;
    user.save();
    log('info', `Updated profile picture for ${user.firstName} ${user.lastName}`);
    return sendPacket(1, 'Successfully uploaded image');
  } catch (err) {
    log('error', err);
    return sendPacket(-1, 'There was an error updating the profile picture');
  }
}

export async function updateUserBanner(image: string, userID: string) {
  const imageBuffer: { type?: string; data?: Buffer } = decodeBase64Image(image);
  if (!imageBuffer.data) return sendPacket(0, 'Invalid base64 image');

  const fileName = `${userID}_banner.jpeg`;
  try {
    const success = await uploadFile('profileBanner', fileName, imageBuffer.data);
    if (!success) return sendPacket(0, 'Failed to upload image');

    await User.updateOne({ _id: userID }, { bannerPicture: fileName });
    log('info', `Updated banner for ${userID}`);
    return sendPacket(1, 'Successfully uploaded image');
  } catch (err) {
    log('error', err);
    return sendPacket(-1, 'Failed to update user model with picture');
  }
}

export async function updateCommunityProfilePicture(
  image: string,
  communityID: string
) {
  const imageBuffer: { type?: string; data?: Buffer } = decodeBase64Image(image);
  if (!imageBuffer.data) return sendPacket(0, 'Invalid base64 image');

  try {
    const success = await uploadFile(
      'communityProfile',
      `${communityID}_profile.jpeg`,
      imageBuffer.data
    );
    if (!success) return sendPacket(0, 'Failed to upload image');

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
  } catch (err) {
    log('error', err);
    return sendPacket(-1, err);
  }

  return sendPacket(1, 'Successfully updated profile picture for community.');
}

export async function updateCommunityBanner(image: string, communityID: string) {
  const imageBuffer: { type?: string; data?: Buffer } = decodeBase64Image(image);
  if (!imageBuffer.data) return sendPacket(0, 'Invalid base64 image');

  const fileName = `${communityID}_banner.jpeg`;
  try {
    const success = await uploadFile('communityBanner', fileName, imageBuffer.data);
    if (!success) return sendPacket(0, 'Failed to upload image');

    await Community.updateOne({ _id: communityID }, { bannerPicture: fileName });
    log('info', `Updated banner for ${communityID}`);
    return sendPacket(1, 'Successfully uploaded image');
  } catch (err) {
    log('error', err);
    return sendPacket(-1, 'Failed to update user model with picture');
  }
}

//GETTERS

export async function getUserProfileAndBanner(
  userID: string,
  isCurrentUser: boolean
) {
  try {
    const user = await User.findById(userID)
      .select('profilePicture bannerPicture')
      .exec();

    if (!user) return sendPacket(0, 'Could not find this user');

    const imagePromises = [];
    if (!isCurrentUser && user.profilePicture)
      imagePromises.push(retrieveSignedUrl('profile', user.profilePicture));
    else imagePromises.push(null);

    if (user.bannerPicture)
      imagePromises.push(retrieveSignedUrl('profileBanner', user.bannerPicture));
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

export async function getCommunityProfileAndBanner(communityID: string) {
  try {
    const community = await Community.findById(communityID).select(
      'profilePicture bannerPicture'
    );
    if (!community) return sendPacket(0, 'Could not find this community');

    const imagePromises = [];
    if (community.profilePicture)
      imagePromises.push(
        retrieveSignedUrl('communityProfile', community.profilePicture)
      );
    else imagePromises.push(null);

    if (community.bannerPicture)
      imagePromises.push(
        retrieveSignedUrl('communityBanner', community.bannerPicture)
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