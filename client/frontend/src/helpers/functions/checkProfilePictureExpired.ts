import { getProfilePictureAndBanner } from '../../api';
import { getStore } from '../../redux/store/persistedStore';

const IMAGE_EXPIRATION = 1000 * 60 * 60 * 24; //24 HOURS

export const checkProfilePictureExpired = async () => {
  const currentTime = Date.now();
  const {
    user: { _id: userID, profilePictureLastUpdated },
  } = getStore().getState();
  if (
    profilePictureLastUpdated &&
    currentTime - profilePictureLastUpdated >= IMAGE_EXPIRATION
  ) {
    const data = await getProfilePictureAndBanner('user', userID, {
      getProfile: true,
    });
    if (data.success === 1)
      return { success: 1, profilePicture: data.content.profile };
    else return { success: 0 };
  }
  return { success: 0 };
};
