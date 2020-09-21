import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { CircularProgress } from '@material-ui/core';

import { FaLock } from 'react-icons/fa';

import { makeRequest } from '../../../helpers/functions';

import { colors } from '../../../theme/Colors';
import CommunityGeneralInfo from './CommunityGeneralInfo';
import CommunityBodyContent from './CommunityBodyContent';

import RSText from '../../../base-components/RSText';
import ProfilePicture from '../../../base-components/ProfilePicture';

import { CommunityStatus } from '../../../helpers/types/communityTypes';

const HEADER_HEIGHT = 60;

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    flex: 1,
    background: colors.primaryText,
    overflow: 'scroll',
    borderLeft: `1px solid ${colors.fourth}`,
    borderRight: `1px solid ${colors.fourth}`,
  },
  body: {},
  coverPhoto: {
    background: colors.bright,
    height: 200,
    objectFit: 'cover',
  },

  profilePictureWrapper: {
    marginTop: -88,
    marginLeft: 50,
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
    marginTop: 20,
    marginLeft: 5,
    marginRight: 5,
  },
}));

type Props = {
  communityID: string;
  userID: string;
  status: CommunityStatus;
  name: string;
  description: string;
  numMembers: number;
  numMutual: number;
  numPending: number;
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
};

function CommunityBody(props: Props) {
  const styles = useStyles();
  const [height, setHeight] = useState(window.innerHeight - HEADER_HEIGHT);
  const [currentProfile, setCurrentProfile] = useState<string>();

  const locked =
    props.status === 'PENDING' || (props.status === 'OPEN' && props.private);

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
      `/api/images/community/${props.communityID}`,
      {},
      true,
      props.accessToken,
      props.refreshToken
    );

    if (data['success'] === 1) {
      setCurrentProfile(data['content']['imageURL']);
    }
  }

  function updateCurrentProfilePicture(imageData: string) {
    setCurrentProfile(imageData);
  }

  function renderProfileAndBackground() {
    return (
      <div style={{ textAlign: 'left' }}>
        <div className={styles.coverPhoto}></div>
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
        {renderProfileAndBackground()}
        {props.loading ? (
          <CircularProgress size={100} className={styles.loadingIndicator} />
        ) : (
          <>
            <CommunityGeneralInfo
              communityID={props.communityID}
              status={props.status}
              name={props.name}
              numMembers={props.numMembers}
              numPending={props.numPending}
              numMutual={props.numMutual}
              type={props.type}
              private={props.private}
              description={props.description}
              accessToken={props.accessToken}
              refreshToken={props.refreshToken}
              updateCommunityStatus={props.updateCommunityStatus}
              isAdmin={props.isAdmin}
              userID={props.userID}
            />
            {locked ? (
              renderLocked()
            ) : (
              <CommunityBodyContent
                className={styles.bodyContent}
                communityID={props.communityID}
                isAdmin={props.isAdmin}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default CommunityBody;
