import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Redirect } from 'react-router-dom';

import { connect } from 'react-redux';
import { updateUser } from '../../redux/actions/user';
import { updateAccessToken, updateRefreshToken } from '../../redux/actions/token';
import { makeRequest, checkDesktop } from '../../helpers/functions';

import EventClientHeader from '../../event-client/EventClientHeader';
import { MainNavigator, DiscoverySidebar } from '../reusable-components';
import HomepageBody from './components/HomepageBody';
import BetaModal from './components/BetaModal';
import { colors } from '../../theme/Colors';

import {
  SHOW_HEADER_NAVIGATION_WIDTH,
  SHOW_DISCOVERY_SIDEBAR_WIDTH,
  HEADER_HEIGHT,
} from '../../helpers/constants';
import { CircularProgress } from '@material-ui/core';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    width: '100%',
  },
  body: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  loadingIndicator: {
    color: colors.primary,
    marginTop: 80,
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
  const [height, setHeight] = useState(window.innerHeight - HEADER_HEIGHT);
  const [width, setWidth] = useState(window.innerWidth);

  const [showBetaModal, setShowBetaModal] = useState(checkDesktop());

  useEffect(() => {
    window.addEventListener('resize', handleResize);

    checkAuth().then(async (authenticated) => {
      if (authenticated) {
        await fetchData();
        await testPosts();
        setLoading(false);
      } else {
        setLoginRedirect(true);
      }
    });
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
    } else {
      props.updateUser({ ...data['content'] });
      return true;
    }
  }

  async function testPosts() {
    const communityID = '5f3feed3cf316529bb10485f';
    const followingCommunityID = '5f5673beabbed8044a2496e2';
    //CREATE INTERNAL CURRENT POST
    // const { data: d1 } = await makeRequest(
    //   'POST',
    //   `/api/posts/community/${communityID}/internal/current`,
    //   { message: 'Internal current member test post' },
    //   true,
    //   props.accessToken,
    //   props.refreshToken
    // );
    //GET ALL INTERNAL CURRENT MEMBER POSTS
    // const { data: d2 } = await makeRequest(
    //   'GET',
    //   `/api/posts/community/${communityID}/internal/current`,
    //   {},
    //   true,
    //   props.accessToken,
    //   props.refreshToken
    // );
    //CREATE INTERNAL ALUMNI POST
    // const { data: d3 } = await makeRequest(
    //   'POST',
    //   `/api/posts/community/${communityID}/internal/alumni`,
    //   { message: 'Internal alumni test post' },
    //   true,
    //   props.accessToken,
    //   props.refreshToken
    // );
    //GET ALL INTERNAL CURRENT ALUMNI POSTS
    // const { data: d4 } = await makeRequest(
    //   'GET',
    //   `/api/posts/community/${communityID}/internal/alumni`,
    //   {},
    //   true,
    //   props.accessToken,
    //   props.refreshToken
    // );
    // GET FOLLOWING FEED - Tested
    // const { data: d5 } = await makeRequest(
    //   'GET',
    //   '/api/posts/feed/following',
    //   {},
    //   true,
    //   props.accessToken,
    //   props.refreshToken
    // );
    //CREATE EXTERNAL POST AS ADMIN - tested
    // const { data: d6 } = await makeRequest(
    //   'POST',
    //   `/api/posts/community/${communityID}/external/admin`,
    //   { message: 'Testing external as admin' },
    //   true,
    //   props.accessToken,
    //   props.refreshToken
    // );
    //CREATE EXTERNAL POST AS FOLLOWING COMMUNITY ADMIN - tested
    // const { data: d7 } = await makeRequest(
    //   'POST',
    //   `/api/posts/community/${communityID}/external/following`,
    //   {
    //     message: 'Testing external as following admin',
    //     fromCommunityID: followingCommunityID,
    //   },
    //   true,
    //   props.accessToken,
    //   props.refreshToken
    // );
    //GET EXTERNAL FEED - Tested
    // const { data: d8 } = await makeRequest(
    //   'GET',
    //   `/api/posts/community/${communityID}/external`,
    //   {},
    //   true,
    //   props.accessToken,
    //   props.refreshToken
    // );
    //BROADCAST AS COMMUNITY ADMIN - Tested
    // const { data: d9 } = await makeRequest(
    //   'POST',
    //   `/api/posts/community/${communityID}/broadcast`,
    //   { message: 'Testing broadcast as admin' },
    //   true,
    //   props.accessToken,
    //   props.refreshToken
    // );
    //CREATE POST EXTERNAL POST AS MEMBER - Tested
    // const { data: d10 } = await makeRequest(
    //   'POST',
    //   `/api/posts/community/${communityID}/external/member`,
    //   { message: 'External member post test' },
    //   true,
    //   props.accessToken,
    //   props.refreshToken
    // );
  }

  async function fetchData() {
    const toCommunity = '5f3feed3cf316529bb10485f'; //POOPOO, use something you are admin of
    const fromCommunity = '5f5673beabbed8044a2496e2'; //Some other other
    const edgeID = ''; //Set based on the new edge thats created

    //CREATE REQUEST
    // const { data: data1 } = await makeRequest(
    //   'POST',
    //   `/api/community/${toCommunity}/follow`,
    //   {
    //     followAsCommunityID: fromCommunity,
    //   },
    //   true,
    //   props.accessToken,
    //   props.refreshToken
    // );

    //ACCEPT REQUEST
    // const { data: data2 } = await makeRequest(
    //   'POST',
    //   `/api/community/${toCommunity}/follow/accept`,
    //   {
    //     edgeID,
    //   },
    //   true,
    //   props.accessToken,
    //   props.refreshToken
    // );

    //REJECT REQUEST
    // const { data: data3 } = await makeRequest(
    //   'POST',
    //   `/api/community/${toCommunity}/follow/reject`,
    //   {
    //     edgeID,
    //   },
    //   true,
    //   props.accessToken,
    //   props.refreshToken
    // );

    //CANCEL REQUEST
    // const { data: data4 } = await makeRequest(
    //   'POST',
    //   `/api/community/${toCommunity}/follow/cancel`,
    //   {
    //     fromCommunityID: fromCommunity,
    //   },
    //   true,
    //   props.accessToken,
    //   props.refreshToken
    // );

    // GET ALL FOLLOWING
    // const { data: data5 } = await makeRequest(
    //   'GET',
    //   `/api/community/${fromCommunity}/following`,
    //   {},
    //   true,
    //   props.accessToken,
    //   props.refreshToken
    // );

    //UNFOLLOW
    // const { data: data6 } = await makeRequest(
    //   'POST',
    //   `/api/community/${toCommunity}/unfollow`,
    //   { fromCommunityID: fromCommunity },
    //   true,
    //   props.accessToken,
    //   props.refreshToken
    // );

    //GET ALL FOLLOWED BY
    // const { data: data7 } = await makeRequest(
    //   'GET',
    //   `/api/community/${fromCommunity}/followedBy`,
    //   {},
    //   true,
    //   props.accessToken,
    //   props.refreshToken
    // );

    //GET ALL PENDING INCOMING FOLLOW REQUESTS
    // const { data: data8 } = await makeRequest(
    //   'GET',
    //   `/api/community/${toCommunity}/follow/pending`,
    //   {},
    //   true,
    //   props.accessToken,
    //   props.refreshToken
    // );
  }

  return (
    <div className={styles.wrapper}>
      {loginRedirect && <Redirect to={`/login?redirect=/home`} />}
      {loading ? (
        <CircularProgress size={100} className={styles.loadingIndicator} />
      ) : (
        <div>
          <EventClientHeader showNavigationWidth={SHOW_HEADER_NAVIGATION_WIDTH} />
          {/* TODO IMPORTANT- Figure out why Material UI Dialog can't be closed on mobile devices  */}
          <BetaModal
            open={showBetaModal}
            onAck={() => {
              setShowBetaModal(false);
            }}
          />
          <div className={styles.body} style={{ height: height }}>
            {width > SHOW_HEADER_NAVIGATION_WIDTH && (
              <MainNavigator currentTab="home" />
            )}
            <HomepageBody />
            {width > SHOW_DISCOVERY_SIDEBAR_WIDTH && <DiscoverySidebar />}
          </div>
        </div>
      )}
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
