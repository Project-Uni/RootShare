import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Button } from '@material-ui/core';
import { connect } from 'react-redux';

import { FaLock } from 'react-icons/fa';

import { colors } from '../../../theme/Colors';
import RSText from '../../../base-components/RSText';
import ProfilePicture from '../../../base-components/ProfilePicture';

import { cropText, makeRequest } from '../../../helpers/functions';
import { CommunityStatus } from '../../../helpers/types';

const MAX_DESC_LEN = 200;

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: colors.primaryText,
    borderRadius: 1,
    padding: 15,
  },
  left: {
    display: 'flex',
    justifyContent: 'flex-start',
    textAlign: 'left',
  },
  profilePic: {
    border: `1px solid ${colors.bright}`,
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
  textContainer: {
    marginLeft: 20,
    marginRight: 20,
  },
  type: {
    marginBottom: 6,
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
  name: {
    '&:hover': { textDecoration: 'underline' },
  },
}));

type Props = {
  style?: any;
  userID: string;
  communityID: string;
  private?: boolean;
  name: string;
  type:
    | 'Social'
    | 'Business'
    | 'Just for Fun'
    | 'Athletics'
    | 'Student Organization'
    | 'Academic';
  description: string;
  memberCount: number;
  mutualMemberCount: number;
  status: CommunityStatus;
  profilePicture: any;
  admin: string;
  setNotification?: (
    successMode: 'success' | 'notify' | 'error',
    message: string
  ) => void;

  accessToken: string;
  refreshToken: string;
};

function CommunityHighlight(props: Props) {
  const styles = useStyles();

  const [communityStatus, setCommunityStatus] = useState<CommunityStatus>(
    props.status
  );
  const [numMembers, setNumMembers] = useState(props.memberCount);

  async function requestJoin() {
    if (props.private) setCommunityStatus('PENDING');
    else {
      setCommunityStatus('JOINED');
      setNumMembers((prevNumMembers) => prevNumMembers + 1);
    }
    const { data } = await makeRequest(
      'POST',
      `/api/community/${props.communityID}/join`,
      {},
      true,
      props.accessToken,
      props.refreshToken
    );

    if (data['success'] !== 1) {
      setCommunityStatus(props.status);
      if (!props.private)
        setNumMembers((prevNumMembers) =>
          prevNumMembers - 1 > 0 ? prevNumMembers - 1 : 0
        );
      props.setNotification &&
        props.setNotification('error', 'There was an error requesting membership');
    }
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
    <div className={[styles.wrapper, props.style || null].join(' ')}>
      <div className={styles.left}>
        <a href={`/community/${props.communityID}`}>
          <ProfilePicture
            type="community"
            height={70}
            width={70}
            borderRadius={50}
            borderWidth={1}
            currentPicture={props.profilePicture}
            pictureStyle={styles.profilePic}
          />
        </a>
        <div className={styles.textContainer}>
          <a href={`/community/${props.communityID}`} className={styles.noUnderline}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <RSText
                type="head"
                size={13}
                color={colors.second}
                className={styles.name}
              >
                {props.name}
              </RSText>
              {props.private && (
                <FaLock
                  color={colors.secondaryText}
                  size={13}
                  className={styles.lock}
                />
              )}
            </div>
          </a>
          <RSText
            type="subhead"
            size={12}
            color={colors.fourth}
            className={styles.type}
          >
            {props.type}
          </RSText>
          <RSText
            type="subhead"
            size={12}
            color={colors.secondaryText}
            className={styles.type}
          >
            {cropText(props.description, MAX_DESC_LEN)}
          </RSText>
          <RSText type="subhead" size={12} color={colors.second}>
            {numMembers} Members | {props.mutualMemberCount} Mutual
          </RSText>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {renderButton()}
      </div>
    </div>
  );
}

const mapStateToProps = (state: { [key: string]: any }) => {
  return {
    accessToken: state.accessToken,
    refreshToken: state.refreshToken,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(CommunityHighlight);
