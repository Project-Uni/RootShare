import { getProfilePictureAndBanner } from '../../api';

const IMAGE_EXPIRATION = 60 * 60 * 24; //24 HOURS

export const checkProfilePictureExpired = async (
  lastUpdated: number,
  userID: string
) => {
  const currentTime = Date.now();
  if (currentTime - lastUpdated >= IMAGE_EXPIRATION) {
    const data = await getProfilePictureAndBanner('user', userID, {
      getProfile: true,
    });
    if (data.success === 1)
      return { success: 1, profilePicture: data.content.profile };
    else return { success: 0 };
  }
  return { success: 0 };
};
