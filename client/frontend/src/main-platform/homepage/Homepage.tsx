import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Redirect } from 'react-router-dom';

import { connect } from 'react-redux';
import { updateUser } from '../../redux/actions/user';
import { updateAccessToken, updateRefreshToken } from '../../redux/actions/token';
import { makeRequest } from '../../helpers/makeRequest';

import RSText from '../../base-components/RSText';

import EventClientHeader from '../../event-client/EventClientHeader';
import { MainNavigator, DiscoverySidebar } from '../reusable-components';
import HomepageBody from './components/HomepageBody';

import { SHOW_HEADER_NAVIGATION_WIDTH } from '../../types/constants';

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

function Homepage(props: Props) {
  const styles = useStyles();

  const [loading, setLoading] = useState(true);
  const [loginRedirect, setLoginRedirect] = useState(false);

  useEffect(() => {
    checkAuth().then(async (authenticated) => {
      if (authenticated) {
        console.log('User is authenticated');
        await fetchData();
        setLoading(false);
      } else {
        setLoginRedirect(true);
      }
    });
  }, []);

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

  async function fetchData() {
    console.log('Fetching data');
  }

  return (
    <div className={styles.wrapper}>
      {loginRedirect && <Redirect to={`/login?redirect=/home`} />}

      {/* TODO?- Create Custom Header for Main Platform */}
      <EventClientHeader showNavigationWidth={SHOW_HEADER_NAVIGATION_WIDTH} />
      <div className={styles.body}>
        <MainNavigator currentTab="home" />
        <HomepageBody />
        <DiscoverySidebar />
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

export default connect(mapStateToProps, mapDispatchToProps)(Homepage);
