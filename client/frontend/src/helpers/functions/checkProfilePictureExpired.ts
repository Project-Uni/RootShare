import { getProfilePictureAndBanner } from '../../api';
import { Dispatch, updateProfilePicture } from '../../redux/actions';
import { getStore } from '../../redux/store/persistedStore';

const IMAGE_EXPIRATION = 1000 * 60 * 60 * 24; //24 HOURS

export const checkProfilePictureExpired = async (dispatch: Dispatch) => {
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
    if (data.success === 1) dispatch(updateProfilePicture(data.content.profile));
  }
};
