import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Button } from '@material-ui/core';
import { connect } from 'react-redux';

import RSText from '../../../base-components/RSText';
import { colors } from '../../../theme/Colors';

import ProfilePicture from '../../../base-components/ProfilePicture';

import { ProfileState } from '../../../helpers/types';
import { makeRequest } from '../../../helpers/functions';

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
    border: `1px solid ${colors.primaryText}`,
  },
  connectButton: {
    background: colors.bright,
    color: colors.primaryText,
    '&:hover': {
      background: colors.primary,
    },
  },
  textContainer: {
    marginLeft: 20,
  },
  name: {
    width: 'max-content',
    marginBottom: 3,
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  work: {
    marginBottom: 3,
  },
  nameContainer: {
    display: 'flex',
  },
  noUnderline: {
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'none',
    },
  },
  pendingStatus: {
    background: colors.secondaryText,
    padding: 3,
    paddingLeft: 5,
    paddingRight: 5,
    borderRadius: 3,
  },
}));

type Props = {
  style?: any;
  userID: string;
  profilePic?: string;
  name: string;
  university: string;
  graduationYear?: number;
  position?: string;
  company?: string;
  mutualConnections?: number;
  mutualCommunities?: number;
  status: ProfileState;
  setNotification?: (
    successMode: 'success' | 'notify' | 'error',
    message: string
  ) => void;

  accessToken: string;
  refreshToken: string;
};

function UserHighlight(props: Props) {
  const styles = useStyles();

  const [userStatus, setUserStatus] = useState<ProfileState>(props.status);

  async function requestConnection() {
    setUserStatus('PENDING');
    const { data } = await makeRequest(
      'POST',
      '/user/requestConnection',
      {
        requestUserID: props.userID,
      },
      true,
      props.accessToken,
      props.refreshToken
    );
    if (data.success !== 1) {
      setUserStatus(props.status);
      props.setNotification &&
        props.setNotification('error', 'Failed to send connection request');
    }
  }

  function renderStatus() {
    if (userStatus === 'PUBLIC')
      return (
        <Button className={styles.connectButton} onClick={requestConnection}>
          Connect
        </Button>
      );
    else if (userStatus === 'CONNECTION')
      return (
        <RSText color={colors.primary} size={11}>
          CONNECTED
        </RSText>
      );
    else if (userStatus === 'PENDING')
      return (
        <RSText
          color={colors.primaryText}
          size={12}
          className={styles.pendingStatus}
        >
          PENDING
        </RSText>
      );
  }

  return (
    <div className={[styles.wrapper, props.style || null].join(' ')}>
      <div className={styles.left}>
        <a href={`/profile/${props.userID}`}>
          <ProfilePicture
            type="profile"
            currentPicture={props.profilePic}
            height={70}
            width={70}
            borderRadius={50}
            className={styles.profilePic}
          />
        </a>
        <div className={styles.textContainer}>
          <div className={styles.nameContainer}>
            <a href={`/profile/${props.userID}`} className={styles.noUnderline}>
              <RSText
                type="head"
                size={13}
                color={colors.second}
                className={styles.name}
              >
                {props.name}
              </RSText>
            </a>
          </div>
          <RSText type="subhead" size={12} color={colors.secondaryText}>
            {props.university}
            {props.graduationYear ? ' ' + props.graduationYear : null}
          </RSText>
          <RSText
            type="subhead"
            size={12}
            color={colors.secondaryText}
            className={styles.work}
          >
            {props.position ? props.position : null}
            {props.position && props.company ? ', ' : null}
            {props.company ? props.company : null}
          </RSText>
          {props.userID === 'self' || (
            <RSText type="subhead" size={12} color={colors.second}>
              {props.mutualConnections || 0} Mutual Connections |{' '}
              {props.mutualCommunities || 0} Mutual Communities
            </RSText>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {renderStatus()}
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

export default connect(mapStateToProps, mapDispatchToProps)(UserHighlight);
