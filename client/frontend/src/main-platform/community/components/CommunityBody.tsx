import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { CircularProgress, Box } from '@material-ui/core';

import { FaLock } from 'react-icons/fa';

import { colors } from '../../../theme/Colors';
import CommunityGeneralInfo from './CommunityGeneralInfo';
import CommunityBodyContent from './CommunityBodyContent';

import RSText from '../../../base-components/RSText';
import ProfilePicture from '../../../base-components/ProfilePicture';

import { CommunityStatus } from '../../../helpers/types';
import { makeRequest } from '../../../helpers/functions';
import { HEADER_HEIGHT } from '../../../helpers/constants';
import ProfileBanner from '../../../base-components/ProfileBanner';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    flex: 1,
    // background: colors.primaryText,
    background: colors.background,
    overflow: 'scroll',
  },
  body: {},
  coverPhoto: {
    background: colors.bright,
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
    border: `8px solid ${colors.primaryText}`,
  },
  loadingIndicator: {
    color: colors.primary,
    marginTop: 50,
  },
  loadingProfilePicture: {
    background: colors['tint-three'],
    height: 175,
    width: 175,
    borderRadius: 100,
    marginTop: -88,
    border: `8px solid ${colors.primaryText}`,
    marginLeft: 50,
  },
  bodyContent: {
    marginTop: 10,
  },
  box: {
    background: colors.primaryText,
    margin: 8,
    paddingBottom: 20,
  },
}));

type CommunityFlags = {
  isMTGFlag: boolean;
};

type Props = {
  communityID: string;
  userID: string;
  status: CommunityStatus;
  name: string;
  universityName: string;
  description: string;
  numMembers: number;
  numMutual: number;
  numPending: number;
  numFollowRequests: number;
  type:
    | 'Social'
    | 'Business'
    | 'Just for Fun'
    | 'Athletics'
    | 'Student Organization'
    | 'Academic';
  private?: boolean;
  loading?: boolean;
  accessToken: string;
  refreshToken: string;
  updateCommunityStatus: (newStatus: CommunityStatus) => any;
  isAdmin?: boolean;
  hasFollowingAccess?: boolean;
  flags: CommunityFlags;
};

function CommunityBody(props: Props) {
  const styles = useStyles();
  const [height, setHeight] = useState(window.innerHeight - HEADER_HEIGHT);
  const [currentProfile, setCurrentProfile] = useState<string>();
  const [currentBanner, setCurrentBanner] = useState<string>();

  const locked =
    props.status === 'PENDING' ||
    (props.status === 'OPEN' && props.private && !props.hasFollowingAccess);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!props.loading) getProfilePicture();
  }, [props.loading]);

  function handleResize() {
    setHeight(window.innerHeight - HEADER_HEIGHT);
  }

  async function getProfilePicture() {
    const { data } = await makeRequest(
      'GET',
      `/api/images/community/${props.communityID}`
    );

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
          editable={props.isAdmin}
          zoomOnClick={!props.isAdmin}
          borderRadius={10}
          currentPicture={currentBanner}
          updateCurrentPicture={(imageData: string) => setCurrentBanner(imageData)}
          _id={props.communityID}
        />
        {props.loading ? (
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
            editable={props.isAdmin}
            borderWidth={8}
            _id={props.communityID}
            updateCurrentPicture={updateCurrentProfilePicture}
            zoomOnClick={!props.isAdmin}
          />
        )}
      </div>
    );
  }

  function renderLocked() {
    return (
      <div style={{ marginTop: 70 }}>
        <FaLock size={90} color={colors.second} />
        <RSText type="subhead" size={20} color={colors.second}>
          You must be a member to view this content.
        </RSText>
      </div>
    );
  }

  return (
    <div className={styles.wrapper} style={{ height: height }}>
      <div className={styles.body}>
        <Box boxShadow={2} borderRadius={10} className={styles.box}>
          {renderProfileAndBackground()}
          {!props.loading && (
            <CommunityGeneralInfo
              communityID={props.communityID}
              status={props.status}
              name={props.name}
              numMembers={props.numMembers}
              numPending={props.numPending}
              numMutual={props.numMutual}
              numFollowRequests={props.numFollowRequests}
              type={props.type}
              private={props.private}
              description={props.description}
              accessToken={props.accessToken}
              refreshToken={props.refreshToken}
              updateCommunityStatus={props.updateCommunityStatus}
              isAdmin={props.isAdmin}
              flags={props.flags}
            />
          )}
        </Box>
        {props.loading && (
          <CircularProgress size={100} className={styles.loadingIndicator} />
        )}
        {props.loading ? (
          <></>
        ) : locked ? (
          renderLocked()
        ) : (
          <CommunityBodyContent
            className={styles.bodyContent}
            communityID={props.communityID}
            universityName={props.universityName}
            communityProfilePicture={currentProfile}
            name={props.name}
            status={props.status}
            isAdmin={props.isAdmin}
            private={props.private}
          />
        )}
      </div>
    </div>
  );
}

export default CommunityBody;
