import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { connect } from 'react-redux';
import { updateUser } from '../../redux/actions/user';
import { updateAccessToken, updateRefreshToken } from '../../redux/actions/token';
import { makeRequest } from '../../helpers/makeRequest';

import ProfilePicture from '../../base-components/ProfilePicture';
import { isString } from 'util';

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
  profilePicture: {
    marginTop: 20,
  },
}));

type Props = {
  user: { [key: string]: any };
  accessToken: string;
  refreshToken: string;
  updateUser: (userInfo: { [key: string]: any }) => void;
  updateAccessToken: (accessToken: string) => void;
  updateRefreshToken: (refreshToken: string) => void;
};

function ProfileDrawer(props: Props) {
  const styles = useStyles();
  const [currentPicture, setCurrentPicture] = useState<string>();

  useEffect(() => {
    getCurrentProfilePicture();
  }, []);

  async function getCurrentProfilePicture() {
    const { data } = await makeRequest(
      'GET',
      `/api/getProfilePicture/${props.user._id}`
    );

    if (data['success'] === 1) {
      setCurrentPicture(data['content']['imageURL']);
    }
  }

  function updateCurrentPicture(imageData: string) {
    setCurrentPicture(imageData);
  }
  return (
    <div className={styles.wrapper}>
      <ProfilePicture
        className={styles.profilePicture}
        editable
        height={150}
        width={150}
        borderRadius={150}
        currentPicture={currentPicture}
        updateCurrentPicture={updateCurrentPicture}
      />
    </div>
  );
}

const mapStateToProps = (state: { [key: string]: any }) => {
  return {
    user: state.user,
    accessToken: state.accessToken,
    refreshToken: state.refreshToken,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    updateUser: (userInfo: { [key: string]: any }) => {
      dispatch(updateUser(userInfo));
    },
    updateAccessToken: (accessToken: string) => {
      dispatch(updateAccessToken(accessToken));
    },
    updateRefreshToken: (refreshToken: string) => {
      dispatch(updateRefreshToken(refreshToken));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ProfileDrawer);
