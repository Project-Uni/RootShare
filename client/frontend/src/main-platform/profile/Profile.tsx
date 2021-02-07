import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Redirect } from 'react-router-dom';

import { connect } from 'react-redux';
import { updateUser } from '../../redux/actions/user';
import { updateAccessToken, updateRefreshToken } from '../../redux/actions/token';

import EventClientHeader from '../../event-client/EventClientHeader';
import { MainNavigator, DiscoverySidebar } from '../reusable-components';
import ProfileBody from './components/ProfileBody';
import {
  SHOW_HEADER_NAVIGATION_WIDTH,
  SHOW_DISCOVERY_SIDEBAR_WIDTH,
  HEADER_HEIGHT,
} from '../../helpers/constants';
import { makeRequest } from '../../helpers/functions';
import { UserToUserRelationship } from '../../helpers/types';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    width: '100%',
  },
  body: {
    display: 'flex',
    justifyContent: 'space-between',
  },
}));

type Props = {
  match: {
    params: { [key: string]: any };
    [key: string]: any;
  };
  user: { [key: string]: any };
  accessToken: string;
  refreshToken: string;
  updateUser: (userInfo: { [key: string]: any }) => void;
  updateAccessToken: (accessToken: string) => void;
  updateRefreshToken: (refreshToken: string) => void;
};

function Profile(props: Props) {
  const styles = useStyles();

  const [loginRedirect, setLoginRedirect] = useState(false);
  const [height, setHeight] = useState(window.innerHeight - HEADER_HEIGHT);
  const [width, setWidth] = useState(window.innerWidth);
  const [currentProfileState, setCurrentProfileState] = useState<
    UserToUserRelationship
  >('OPEN');

  //If it is the logged in user's, then profileID = 'user', else it is that user's ID
  const profileID = props.match.params['profileID'];

  useEffect(() => {
    window.addEventListener('resize', handleResize);

    checkAuth().then(async (authenticated) => {
      if (!authenticated) setLoginRedirect(true);
    });
    updateProfileState();
  }, []);

  function handleResize() {
    setHeight(window.innerHeight - HEADER_HEIGHT);
    setWidth(window.innerWidth);
  }

  async function checkAuth() {
    const { data } = await makeRequest(
      'GET',
      '/user/getCurrent',
      {},
      true,
      props.accessToken,
      props.refreshToken
    );
    if (data['success'] !== 1) {
      props.updateUser({});
      props.updateAccessToken('');
      props.updateRefreshToken('');
      return false;
    }
    props.updateUser({ ...data['content'] });
    return true;
  }

  async function updateProfileState() {
    if (profileID === 'user') return setCurrentProfileState('SELF');

    const { data } = await makeRequest(
      'POST',
      '/user/checkConnectedWithUser',
      { requestUserID: profileID },
      true,
      props.accessToken,
      props.refreshToken
    );

    if (data['success'] === 1) setCurrentProfileState(data['content']['connected']);
  }

  return (
    <div className={styles.wrapper}>
      {loginRedirect && <Redirect to={`/login?redirect=/profile/${profileID}`} />}
      <EventClientHeader showNavigationWidth={SHOW_HEADER_NAVIGATION_WIDTH} />
      <div className={styles.body} style={{ height: height }}>
        {width > SHOW_HEADER_NAVIGATION_WIDTH && (
          <MainNavigator currentTab="profile" />
        )}
        <ProfileBody
          profileID={profileID}
          currentProfileState={currentProfileState}
          updateProfileState={updateProfileState}
        />
        {width > SHOW_DISCOVERY_SIDEBAR_WIDTH && <DiscoverySidebar />}
      </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(Profile);
