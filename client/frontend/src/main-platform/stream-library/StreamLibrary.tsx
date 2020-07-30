import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Redirect } from 'react-router-dom';

import { connect } from 'react-redux';
import { updateUser } from '../../redux/actions/user';
import { updateAccessToken, updateRefreshToken } from '../../redux/actions/token';
import { makeRequest } from '../../helpers/functions';

import EventClientHeader from '../../event-client/EventClientHeader';
import { MainNavigator, DiscoverySidebar } from '../reusable-components';
import StreamLibraryBody from './components/StreamLibraryBody';

import { SHOW_DISCOVERY_SIDEBAR_WIDTH } from '../../helpers/constants/sizing';

const LIBRARY_NAVIGATION_WIDTH = 850;

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
  user: { [key: string]: any };
  accessToken: string;
  refreshToken: string;
  updateUser: (userInfo: { [key: string]: any }) => void;
  updateAccessToken: (accessToken: string) => void;
  updateRefreshToken: (refreshToken: string) => void;
};

function StreamLibrary(props: Props) {
  const styles = useStyles();

  const [loginRedirect, setLoginRedirect] = useState(false);
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    window.addEventListener('resize', handleResize);

    checkAuth().then(async (authenticated) => {
      if (authenticated) {
        console.log('User is authenticated');
      } else {
        setLoginRedirect(true);
      }
    });
  }, []);

  function handleResize() {
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
    return true;
  }

  return (
    <div className={styles.wrapper}>
      {loginRedirect && <Redirect to={`/login?redirect=/library`} />}
      <EventClientHeader showNavigationWidth={LIBRARY_NAVIGATION_WIDTH} />
      <div className={styles.body}>
        {width > LIBRARY_NAVIGATION_WIDTH && <MainNavigator currentTab="library" />}
        <StreamLibraryBody />
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

export default connect(mapStateToProps, mapDispatchToProps)(StreamLibrary);
