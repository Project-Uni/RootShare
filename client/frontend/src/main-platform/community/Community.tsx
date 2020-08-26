import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Redirect } from 'react-router-dom';

import { connect } from 'react-redux';
import { updateUser } from '../../redux/actions/user';
import { updateAccessToken, updateRefreshToken } from '../../redux/actions/token';
import { makeRequest } from '../../helpers/functions';

import EventClientHeader from '../../event-client/EventClientHeader';
import { MainNavigator, DiscoverySidebar } from '../reusable-components';
import CommunityBody from './components/CommunityBody';

import {
  SHOW_HEADER_NAVIGATION_WIDTH,
  SHOW_DISCOVERY_SIDEBAR_WIDTH,
} from '../../helpers/constants';
import { Community } from '../../helpers/types';

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

function CommunityDetails(props: Props) {
  const styles = useStyles();

  const [loading, setLoading] = useState(true);
  const [loginRedirect, setLoginRedirect] = useState(false);
  const [showInvalid, setShowInvalid] = useState(false);
  const [width, setWidth] = useState(window.innerWidth);

  const [communityInfo, setCommunityInfo] = useState<Community | {}>({});
  const [communityStatus, setCommunityStatus] = useState<
    'PENDING' | 'JOINED' | 'OPEN'
  >('OPEN');
  const [isAdmin, setIsAdmin] = useState(false);
  const [mutualConnections, setMutualConnections] = useState<string[]>([]);

  const orgID = props.match.params['orgID'];

  useEffect(() => {
    window.addEventListener('resize', handleResize);

    checkAuth().then(async (authenticated) => {
      if (authenticated) {
        fetchCommunityInfo().then(() => {
          setLoading(false);
        });
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

  async function fetchCommunityInfo() {
    const { data } = await makeRequest(
      'GET',
      `/api/community/${orgID}/info`,
      {},
      true,
      props.accessToken,
      props.refreshToken
    );
    if (data.success === 1) {
      setCommunityInfo(data.content['community']);
      initializeCommunityStatus(data.content['community']);
      setMutualConnections(data.content['mutualConnections']);
    } else {
      setShowInvalid(true);
    }
  }

  function initializeCommunityStatus(communityDetails: Community) {
    if (communityDetails.admin._id === props.user._id) {
      setIsAdmin(true);
      setCommunityStatus('JOINED');
    } else if (communityDetails.members.indexOf(props.user._id) !== -1)
      setCommunityStatus('JOINED');
    else if (communityDetails.pendingMembers.indexOf(props.user._id) !== -1)
      setCommunityStatus('PENDING');
    else setCommunityStatus('OPEN');
  }

  function updateCommunityStatus(newStatus: 'OPEN' | 'JOINED' | 'PENDING') {
    setCommunityStatus(newStatus);
  }

  return (
    <div className={styles.wrapper}>
      {loginRedirect && <Redirect to={`/login?redirect=/community/${orgID}`} />}
      <EventClientHeader showNavigationWidth={SHOW_HEADER_NAVIGATION_WIDTH} />
      <div className={styles.body}>
        {width > SHOW_HEADER_NAVIGATION_WIDTH && <MainNavigator currentTab="none" />}
        <CommunityBody
          status={communityStatus}
          name={(communityInfo as Community).name}
          numMembers={(communityInfo as Community).members?.length || 0}
          numPending={(communityInfo as Community).pendingMembers?.length || 0}
          numMutual={mutualConnections.length}
          type={(communityInfo as Community).type}
          private={(communityInfo as Community).private}
          description={(communityInfo as Community).description}
          loading={loading}
          accessToken={props.accessToken}
          refreshToken={props.refreshToken}
          communityID={(communityInfo as Community)._id}
          updateCommunityStatus={updateCommunityStatus}
          isAdmin={isAdmin}
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

export default connect(mapStateToProps, mapDispatchToProps)(CommunityDetails);
