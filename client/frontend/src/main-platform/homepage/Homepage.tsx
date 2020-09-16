import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Redirect } from 'react-router-dom';

import { connect } from 'react-redux';
import { updateUser } from '../../redux/actions/user';
import { updateAccessToken, updateRefreshToken } from '../../redux/actions/token';
import { makeRequest } from '../../helpers/functions';

import EventClientHeader from '../../event-client/EventClientHeader';
import { MainNavigator, DiscoverySidebar } from '../reusable-components';
import HomepageBody from './components/HomepageBody';

import {
  SHOW_HEADER_NAVIGATION_WIDTH,
  SHOW_DISCOVERY_SIDEBAR_WIDTH,
} from '../../helpers/constants';

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
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    window.addEventListener('resize', handleResize);

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

  async function fetchData() {
    //PooPoo - 5f3feed3cf316529bb10485f
    //Other Community - 5f5673beabbed8044a2496e2

    //CREATE REQUEST
    // const { data: data1 } = await makeRequest(
    //   'POST',
    //   `/api/community/${'5f3feed3cf316529bb10485f'}/follow`,
    //   {
    //     followAsCommunityID: '5f5673beabbed8044a2496e2',
    //   },
    //   true,
    //   props.accessToken,
    //   props.refreshToken
    // );

    //ACCEPT REQUEST
    // const { data: data2 } = await makeRequest(
    //   'POST',
    //   `/api/community/${'5f3feed3cf316529bb10485f'}/follow/accept`,
    //   {
    //     edgeID: '5f615724f3e3a6096fd293a4',
    //   },
    //   true,
    //   props.accessToken,
    //   props.refreshToken
    // );

    //REJECT REQUEST
    // const { data } = await makeRequest(
    //   'POST',
    //   `/api/community/${'5f3feed3cf316529bb10485f'}/follow/reject`,
    //   {
    //     edgeID: '5f60474a7f32161eacb05412',
    //   },
    //   true,
    //   props.accessToken,
    //   props.refreshToken
    // );

    //CANCEL REQUEST
    // const { data } = await makeRequest(
    //   'POST',
    //   `/api/community/${'5f3feed3cf316529bb10485f'}/follow/cancel`,
    //   {
    //     edgeID: '5f6152ef9e0f20065cfd0a0f',
    //     fromCommunityID: '5f5673beabbed8044a2496e2',
    //   },
    //   true,
    //   props.accessToken,
    //   props.refreshToken
    // );

    //GET ALL FOLLOWING
    // const { data: data3 } = await makeRequest(
    //   'GET',
    //   `/api/community/${'5f5673beabbed8044a2496e2'}/following`,
    //   {},
    //   true,
    //   props.accessToken,
    //   props.refreshToken
    // );

    //UNFOLLOW
    const { data: data3 } = await makeRequest(
      'POST',
      `/api/community/${'5f3feed3cf316529bb10485f'}/unfollow`,
      { fromCommunityID: '5f5673beabbed8044a2496e2' },
      true,
      props.accessToken,
      props.refreshToken
    );
  }

  return (
    <div className={styles.wrapper}>
      {loginRedirect && <Redirect to={`/login?redirect=/home`} />}

      {/* TODO?- Create Custom Header for Main Platform */}
      <EventClientHeader showNavigationWidth={SHOW_HEADER_NAVIGATION_WIDTH} />
      <div className={styles.body}>
        {width > SHOW_HEADER_NAVIGATION_WIDTH && <MainNavigator currentTab="home" />}
        <HomepageBody />
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

export default connect(mapStateToProps, mapDispatchToProps)(Homepage);
