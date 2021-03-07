import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { CircularProgress, Box } from '@material-ui/core';

import { FaLock } from 'react-icons/fa';

import CommunityGeneralInfo from './CommunityGeneralInfo';
import CommunityBodyContent from './CommunityBodyContent';

import RSText from '../../../base-components/RSText';
import ProfilePicture from '../../../base-components/ProfilePicture';

import {
  UserToCommunityRelationship,
  U2CR,
  UserType,
  Community,
} from '../../../helpers/types';
import { makeRequest } from '../../../helpers/functions';
import { HEADER_HEIGHT } from '../../../helpers/constants';
import ProfileBanner from '../../../base-components/ProfileBanner';
import Theme from '../../../theme/Theme';
import { connect } from 'react-redux';
import { getProfilePictureAndBanner } from '../../../api';
import { useParams } from 'react-router-dom';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    flex: 1,
    background: Theme.background,
    overflow: 'scroll',
  },
  body: {},
  coverPhoto: {
    background: Theme.bright,
    height: 200,
    objectFit: 'cover',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  profilePictureWrapper: {
    marginTop: -88,
    marginLeft: 50,
    display: 'inline-block',
  },
  profilePicture: {
    border: `8px solid ${Theme.white}`,
  },
  loadingIndicator: {
    color: Theme.bright,
    marginTop: 50,
  },
  loadingProfilePicture: {
    background: Theme.background,
    height: 175,
    width: 175,
    borderRadius: 100,
    marginTop: -88,
    border: `8px solid ${Theme.white}`,
    marginLeft: 50,
  },
  bodyContent: {
    marginTop: 10,
  },
  box: {
    background: Theme.white,
    margin: 8,
    paddingBottom: 20,
  },
}));

export type CommunityFlags = {
  isMTGFlag: boolean;
};

type Props = {
  user: { [k: string]: any };
};

function CommunityBody(props: Props) {
  const styles = useStyles();
  const [height, setHeight] = useState(window.innerHeight - HEADER_HEIGHT);
  const [currentProfile, setCurrentProfile] = useState<string>();
  const [currentBanner, setCurrentBanner] = useState<string>();

  const [loading, setLoading] = useState(true);

  const [showInvalid, setShowInvalid] = useState(false);
  const [communityInfo, setCommunityInfo] = useState<Community>();
  const [communityStatus, setCommunityStatus] = useState<
    UserToCommunityRelationship
  >('open');
  const [isAdmin, setIsAdmin] = useState(false);
  const [mutualConnections, setMutualConnections] = useState<string[]>([]);

  const [hasFollowingAccess, setHasFollowingAccess] = useState(false);
  const [locked, setLocked] = useState<boolean>(true);

  const { communityID } = useParams<{ communityID: string }>();

  useEffect(() => {
    window.addEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!loading) {
      getProfilePicture();
    }
  }, [loading]);

  useEffect(() => {
    fetchCommunityInfo().then(() => {
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (
      !(
        communityStatus === U2CR.PENDING ||
        (communityStatus === U2CR.OPEN &&
          communityInfo?.private &&
          !hasFollowingAccess)
      )
    ) {
      setLocked(false);
    }
  }, [communityStatus]);

  function handleResize() {
    setHeight(window.innerHeight - HEADER_HEIGHT);
  }

  async function fetchCommunityInfo() {
    const { data } = await makeRequest('GET', `/api/community/${communityID}/info`);
    if (data.success === 1) {
      setCommunityInfo(data.content['community']);
      initializeCommunityStatus(data.content['community']);
      setMutualConnections(data.content['mutualConnections']);
      setHasFollowingAccess(data.content['hasFollowingAccess']);
      return true;
    } else {
      setShowInvalid(true);
      return false;
    }
  }

  function initializeCommunityStatus(communityDetails: Community) {
    if ((communityDetails.admin as UserType)._id === props.user._id) {
      setIsAdmin(true);
      setCommunityStatus(U2CR.JOINED);
    } else if (communityDetails.members.indexOf(props.user._id) !== -1)
      setCommunityStatus(U2CR.JOINED);
    else if (communityDetails.pendingMembers.indexOf(props.user._id) !== -1)
      setCommunityStatus(U2CR.PENDING);
    else setCommunityStatus(U2CR.OPEN);
  }

  function updateCommunityStatus(newStatus: UserToCommunityRelationship) {
    setCommunityStatus(newStatus);
  }

  async function getProfilePicture() {
    const data = await getProfilePictureAndBanner('community', communityID, {
      getProfile: true,
      getBanner: true,
    });

    if (data['success'] === 1) {
      setCurrentProfile(data.content.profile);
      setCurrentBanner(data.content.banner);
    }
  }

  function updateCurrentProfilePicture(imageData: string) {
    setCurrentProfile(imageData);
  }

  function renderProfileAndBackground() {
    return (
      <div style={{ textAlign: 'left' }}>
        <ProfileBanner
          type="community"
          height={200}
          editable={isAdmin}
          zoomOnClick={!isAdmin}
          borderRadius={10}
          currentPicture={currentBanner}
          updateCurrentPicture={(imageData: string) => setCurrentBanner(imageData)}
          _id={communityID}
        />
        {loading ? (
          <div className={[styles.loadingProfilePicture].join(' ')}></div>
        ) : (
          <ProfilePicture
            currentPicture={currentProfile}
            type="community"
            height={175}
            width={175}
            borderRadius={100}
            className={styles.profilePictureWrapper}
            pictureStyle={styles.profilePicture}
            editable={isAdmin}
            borderWidth={8}
            _id={communityID}
            updateCurrentPicture={updateCurrentProfilePicture}
            zoomOnClick={!isAdmin}
          />
        )}
      </div>
    );
  }

  function renderLocked() {
    return (
      <div style={{ marginTop: 70 }}>
        <FaLock size={90} color={Theme.primary} />
        <RSText type="subhead" size={20} color={Theme.primary}>
          You must be a member to view this content.
        </RSText>
      </div>
    );
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
    <div className={styles.wrapper} style={{ height: height }}>
      {showInvalid ? (
        renderInvalid()
      ) : (
        <div className={styles.body}>
          <Box boxShadow={2} borderRadius={10} className={styles.box}>
            {renderProfileAndBackground()}
            {loading ? (
              <CircularProgress size={100} className={styles.loadingIndicator} />
            ) : (
              <CommunityGeneralInfo
                communityID={communityID}
                status={communityStatus}
                name={communityInfo?.name || ''}
                numMembers={communityInfo?.members.length || 0}
                numPending={communityInfo?.pendingMembers.length || 0}
                numMutual={mutualConnections.length}
                numFollowRequests={
                  communityInfo?.incomingPendingCommunityFollowRequests?.length || 0
                }
                type={communityInfo?.type || 'Business'}
                private={communityInfo?.private}
                description={communityInfo?.description || ''}
                updateCommunityStatus={updateCommunityStatus}
                isAdmin={isAdmin}
                flags={{ isMTGFlag: communityInfo?.isMTGFlag || false }}
              />
            )}
          </Box>
          {loading ? (
            <></>
          ) : locked ? (
            renderLocked()
          ) : (
            <CommunityBodyContent
              className={styles.bodyContent}
              communityID={communityID}
              universityName={communityInfo?.university.universityName || ''}
              communityProfilePicture={currentProfile}
              name={communityInfo?.name || ''}
              status={communityStatus}
              isAdmin={isAdmin}
              private={communityInfo?.private}
              flags={{ isMTGFlag: communityInfo?.isMTGFlag || false }}
            />
          )}
        </div>
      )}
    </div>
  );
}

const mapStateToProps = (state: { [key: string]: any }) => {
  return {
    user: state.user,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(CommunityBody);
