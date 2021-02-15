import { getProfilePictureAndBanner } from '../../api';
import {
  Dispatch,
  dispatchSnackbar,
  updateProfilePicture,
} from '../../redux/actions';
import { getStore } from '../../redux/store/persistedStore';

const IMAGE_EXPIRATION = 1000 * 60 * 60 * 24; //24 HOURS

export const checkProfilePictureExpired = async (dispatch: Dispatch) => {
  const currentTime = Date.now();
  const {
    user: { _id: userID, profilePictureLastUpdated, profilePicture },
  } = getStore().getState();
  if (
    profilePicture &&
    (!profilePictureLastUpdated ||
      currentTime - profilePictureLastUpdated >= IMAGE_EXPIRATION)
  ) {
    const data = await getProfilePictureAndBanner('user', userID, {
      getProfile: true,
    });
    if (data.success === 1) dispatch(updateProfilePicture(data.content.profile));
    else
      dispatch(
        dispatchSnackbar({
          mode: 'error',
          message: 'There was an error updating profile picture',
        })
      );
  }
};
