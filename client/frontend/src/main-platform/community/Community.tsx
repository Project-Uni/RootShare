import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Redirect } from 'react-router-dom';

import { connect } from 'react-redux';
import { updateUser } from '../../redux/actions/user';
import { updateAccessToken, updateRefreshToken } from '../../redux/actions/token';

import EventClientHeader from '../../event-client/EventClientHeader';
import { MainNavigator } from '../reusable-components';
import CommunityBody from './components/CommunityBody';

import FollowSidebar from './components/Sidebar/FollowSidebar';

import {
  SHOW_HEADER_NAVIGATION_WIDTH,
  SHOW_DISCOVERY_SIDEBAR_WIDTH,
} from '../../helpers/constants';
import RSText from '../../base-components/RSText';

import { makeRequest } from '../../helpers/functions';
import { Community, CommunityStatus, UserType } from '../../helpers/types';
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

  const [hasFollowingAccess, setHasFollowingAccess] = useState(false);

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
    const { data } = await makeRequest('GET', '/user/getCurrent');
    if (data['success'] !== 1) {
      props.updateUser({});
      props.updateAccessToken('');
      props.updateRefreshToken('');
      return false;
    }
    props.updateUser({ ...data['content'] });
    return true;
  }

  async function fetchCommunityInfo() {
    const { data } = await makeRequest('GET', `/api/community/${orgID}/info`);
    if (data.success === 1) {
      setCommunityInfo(data.content['community']);
      initializeCommunityStatus(data.content['community']);
      setMutualConnections(data.content['mutualConnections']);
      setHasFollowingAccess(data.content['hasFollowingAccess']);
    } else {
      setShowInvalid(true);
    }
  }

  function initializeCommunityStatus(communityDetails: Community) {
    if ((communityDetails.admin as UserType)._id === props.user._id) {
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

  const communityInfoComplete = communityInfo as Community;
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
            name={communityInfoComplete.name}
            universityName={communityInfoComplete.university?.universityName}
            numMembers={communityInfoComplete.members?.length || 0}
            numPending={communityInfoComplete.pendingMembers?.length || 0}
            numMutual={mutualConnections.length}
            numFollowRequests={
              communityInfoComplete.incomingPendingCommunityFollowRequests?.length ||
              0
            }
            type={communityInfoComplete.type}
            private={communityInfoComplete.private}
            description={communityInfoComplete.description}
            loading={loading}
            accessToken={props.accessToken}
            refreshToken={props.refreshToken}
            communityID={communityInfoComplete._id}
            updateCommunityStatus={updateCommunityStatus}
            isAdmin={isAdmin}
            userID={props.user._id}
            hasFollowingAccess={hasFollowingAccess}
            flags={{ isMTGFlag: communityInfoComplete.isMTGFlag || false }}
          />
        )}
        {width > SHOW_DISCOVERY_SIDEBAR_WIDTH && (
          <FollowSidebar communityID={orgID} />
        )}
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
