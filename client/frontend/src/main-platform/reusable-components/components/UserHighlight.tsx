import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { Button, Box } from '@material-ui/core';

import RSText from '../../../base-components/RSText';
import { colors } from '../../../theme/Colors';

import ProfilePicture from '../../../base-components/ProfilePicture';

import { ProfileState, ConnectionRequestType } from '../../../helpers/types';
import { makeRequest } from '../../../helpers/functions';

const useStyles = makeStyles((_: any) => ({
  box: {
    background: colors.primaryText,
  },
  wrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  pendingButtonContainer: {
    display: 'flex',
  },
  removeButton: {
    color: colors.primaryText,
    background: 'gray',
  },
  acceptButton: {
    color: colors.primaryText,
    background: colors.bright,
    marginLeft: 8,
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
  connectionRequestID?: string;
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
    setUserStatus('TO');
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

  async function respondRequest(accepted: boolean) {
    setUserStatus(accepted ? 'CONNECTION' : 'PUBLIC');
    const { data } = await makeRequest(
      'POST',
      '/user/respondConnection',
      {
        requestID: props.connectionRequestID,
        accepted,
      },
      true,
      props.accessToken,
      props.refreshToken
    );

    if (data['success'] !== 1) {
      setUserStatus(props.status);
      props.setNotification &&
        props.setNotification(
          'error',
          `Failed to ${accepted ? 'accept' : 'remove'} connection request`
        );
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
    else if (userStatus === 'TO')
      return (
        <RSText
          color={colors.primaryText}
          size={12}
          className={styles.pendingStatus}
        >
          PENDING
        </RSText>
      );
    else if (userStatus === 'FROM')
      return (
        <div className={styles.pendingButtonContainer}>
          <Button
            className={styles.removeButton}
            onClick={() => respondRequest(false)}
          >
            Remove
          </Button>
          <Button
            className={styles.acceptButton}
            onClick={() => respondRequest(true)}
          >
            Accept
          </Button>
        </div>
      );
  }

  return (
    <Box
      boxShadow={2}
      borderRadius={10}
      className={[props.style, styles.box].join(' ')}
    >
      <div className={styles.wrapper}>
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
            {props.userID === 'user' || (
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
    </Box>
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
