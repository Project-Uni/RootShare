import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Redirect } from 'react-router-dom';

import { connect } from 'react-redux';
import { updateUser } from '../../redux/actions/user';
import { updateAccessToken, updateRefreshToken } from '../../redux/actions/token';

import EventClientHeader from '../../event-client/EventClientHeader';
import { MainNavigator } from '../reusable-components';
import CommunityBody from './components/CommunityBody';

import FollowedByCommunities from './components/FollowedByCommunities';

import {
  SHOW_HEADER_NAVIGATION_WIDTH,
  SHOW_DISCOVERY_SIDEBAR_WIDTH,
} from '../../helpers/constants';
import RSText from '../../base-components/RSText';

import { makeRequest } from '../../helpers/functions';
import { Community, CommunityStatus } from '../../helpers/types';
import { HEADER_HEIGHT } from '../../helpers/constants';

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
  const [height, setHeight] = useState(window.innerHeight - HEADER_HEIGHT);
  const [width, setWidth] = useState(window.innerWidth);

  const [communityInfo, setCommunityInfo] = useState<Community | {}>({});
  const [communityStatus, setCommunityStatus] = useState<CommunityStatus>('OPEN');
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

  function updateCommunityStatus(newStatus: CommunityStatus) {
    setCommunityStatus(newStatus);
  }

  function renderInvalid() {
    return (
      <div style={{ marginTop: 30, marginLeft: 60, marginRight: 60 }}>
        <RSText type="head" size={24} bold>
          The community you are trying to reach does not exist.
        </RSText>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      {loginRedirect && <Redirect to={`/login?redirect=/community/${orgID}`} />}
      <EventClientHeader showNavigationWidth={SHOW_HEADER_NAVIGATION_WIDTH} />
      <div className={styles.body} style={{ height: height }}>
        {width > SHOW_HEADER_NAVIGATION_WIDTH && <MainNavigator currentTab="none" />}
        {showInvalid ? (
          renderInvalid()
        ) : (
          <CommunityBody
            status={communityStatus}
            name={(communityInfo as Community).name}
            numMembers={(communityInfo as Community).members?.length || 0}
            numPending={(communityInfo as Community).pendingMembers?.length || 0}
            numMutual={mutualConnections.length}
            numFollowRequests={
              (communityInfo as Community).incomingPendingCommunityFollowRequests
                ?.length || 0
            }
            type={(communityInfo as Community).type}
            private={(communityInfo as Community).private}
            description={(communityInfo as Community).description}
            loading={loading}
            accessToken={props.accessToken}
            refreshToken={props.refreshToken}
            communityID={(communityInfo as Community)._id}
            updateCommunityStatus={updateCommunityStatus}
            isAdmin={isAdmin}
            userID={props.user._id}
          />
        )}
        {width > SHOW_DISCOVERY_SIDEBAR_WIDTH && <FollowedByCommunities />}
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
