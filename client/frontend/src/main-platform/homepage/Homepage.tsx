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
import BetaModal from './components/BetaModal';

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

  const [showBetaModal, setShowBetaModal] = useState(true);

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
    const toCommunity = '5f3feed3cf316529bb10485f'; //POOPOO, use something you are admin of
    const fromCommunity = '5f5673beabbed8044a2496e2'; //Some other other
    const edgeID = ''; //Set based on the new edge thats created

    //CREATE REQUEST
    const { data: data1 } = await makeRequest(
      'POST',
      `/api/community/${toCommunity}/follow`,
      {
        followAsCommunityID: fromCommunity,
      },
      true,
      props.accessToken,
      props.refreshToken
    );

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
      <EventClientHeader showNavigationWidth={SHOW_HEADER_NAVIGATION_WIDTH} />
      <BetaModal
        open={showBetaModal}
        onAck={() => {
          setShowBetaModal(false);
        }}
      />
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
