import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { Box, Button } from '@material-ui/core';
import { FaLock } from 'react-icons/fa';

import { colors } from '../../../theme/Colors';
import RSText from '../../../base-components/RSText';
import ProfilePicture from '../../../base-components/ProfilePicture';

import { makeRequest } from '../../../helpers/functions';
import { CommunityType, CommunityStatus } from '../../../helpers/types';

const useStyles = makeStyles((_: any) => ({
  box: {
    background: colors.primaryText,
  },
  wrapper: {
    display: 'flex',
    justifyContent: 'flex-start',
    textAlign: 'left',
    paddingBottom: 20,
    paddingTop: 20,
    paddingLeft: 20,
    paddingRight: 20,
  },
  communityBody: {
    flex: 1,
    display: 'flex',
    justifyContent: 'space-between',
    marginLeft: 20,
    marginRight: 20,
  },
  left: {
    display: 'flex',
    flexDirection: 'column',
  },
  right: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  noUnderline: {
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'none',
    },
  },
  lock: {
    marginLeft: 10,
  },
  divider: {
    marginLeft: 10,
    marginRight: 10,
  },
  secondRow: {
    display: 'flex',
    alignItems: 'center',
    marginTop: 5,
  },
  description: {
    marginTop: 10,
    marginBottom: 8,
  },
  status: {
    padding: '7px 10px',
    borderRadius: 4,
  },
  joinedStatus: {
    background: colors.primary,
  },
  pendingStatus: {
    background: colors.secondaryText,
  },
  nameHover: {
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  connectButton: {
    background: colors.bright,
    color: colors.primaryText,
    '&:hover': {
      background: colors.primary,
    },
  },
  pendingText: {
    background: colors.secondaryText,
    padding: 3,
    paddingLeft: 5,
    paddingRight: 5,
    borderRadius: 3,
  },
}));

type Props = {
  userID: string;
  communityID: string;
  name: string;
  description: string;
  private?: boolean;
  type: CommunityType;
  admin: string;
  memberCount: number;
  mutualMemberCount: number;
  profilePicture?: any;
  style?: any;
  status: CommunityStatus;
  setNotification?: (
    successMode: 'success' | 'notify' | 'error',
    message: string
  ) => void;

  accessToken: string;
  refreshToken: string;
};

function CommunityOverview(props: Props) {
  const styles = useStyles();

  const [communityStatus, setCommunityStatus] = useState<CommunityStatus>(
    props.status
  );
  const [numMembers, setNumMembers] = useState(props.memberCount);

  async function requestJoin() {
    const { data } = await makeRequest(
      'POST',
      `/api/community/${props.communityID}/join`,
      {},
      true,
      props.accessToken,
      props.refreshToken
    );

    if (data['success'] === 1) {
      if (props.private) setCommunityStatus('PENDING');
      else {
        setCommunityStatus('JOINED');
        setNumMembers((prevNumMembers) => prevNumMembers + 1);
      }
    } else
      props.setNotification &&
        props.setNotification('error', 'There was an error requesting membership');
  }

  function renderName() {
    return (
      <div style={{ display: 'inline-block' }}>
        <a href={`/community/${props.communityID}`} className={styles.noUnderline}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <RSText
              type="head"
              size={14}
              color={colors.second}
              className={styles.nameHover}
            >
              {props.name}
            </RSText>
            {props.private && (
              <FaLock
                color={colors.secondaryText}
                size={14}
                className={styles.lock}
              />
            )}
          </div>
        </a>
      </div>
    );
  }

  function renderTypeAndCounts() {
    return (
      <div className={styles.secondRow}>
        <RSText color={colors.second} size={12} type="body">
          {props.type}
        </RSText>
        <RSText
          color={colors.secondaryText}
          size={14}
          type="body"
          className={styles.divider}
        >
          |
        </RSText>
        <RSText color={colors.second} size={12} type="body">
          {numMembers} Members
        </RSText>
        <RSText
          color={colors.secondaryText}
          size={14}
          type="body"
          className={styles.divider}
        >
          |
        </RSText>
        <RSText color={colors.second} size={12} type="body">
          {props.mutualMemberCount} Connections
        </RSText>
      </div>
    );
  }

  function renderButton() {
    if (communityStatus === 'OPEN')
      return (
        <Button className={styles.connectButton} onClick={requestJoin}>
          Join
        </Button>
      );
    else if (communityStatus === 'PENDING')
      return (
        <RSText color={colors.primaryText} size={12} className={styles.pendingText}>
          PENDING
        </RSText>
      );
    else
      return (
        <RSText color={colors.primary} size={12}>
          {props.userID === props.admin ? 'ADMIN' : 'MEMBER'}
        </RSText>
      );
  }

  return (
    <Box
      className={[styles.box, props.style].join(' ')}
      boxShadow={2}
      borderRadius={10}
    >
      <div className={styles.wrapper}>
        <a href={`/community/${props.communityID}`}>
          <ProfilePicture
            type="community"
            currentPicture={props.profilePicture}
            height={80}
            width={80}
            borderRadius={60}
          />
        </a>
        <div className={styles.communityBody}>
          <div className={styles.left}>
            {renderName()}
            {renderTypeAndCounts()}
            <RSText
              type="body"
              size={12}
              color={colors.secondaryText}
              className={styles.description}
            >
              {props.description}
            </RSText>
            {/* NOTE - Hiding this for now because our current database strategy doesn't support this */}
            {/* <RSText color={colors.second} size={11} type="body">
          Joined {props.joinedDate}
        </RSText> */}
          </div>
          <div className={styles.right}>{renderButton()}</div>
        </div>
      </div>
    </Box>
  );
}

export default CommunityOverview;
