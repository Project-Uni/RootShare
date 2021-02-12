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
  updateConnectionStatus?: (connectionRequestID: string) => void;
  setNotification?: (
    successMode: 'success' | 'notify' | 'error',
    message: string
  ) => void;

  user: any;
};

function UserHighlight(props: Props) {
  const styles = useStyles();

  const {
    style,
    userID,
    profilePic,
    name,
    university,
    graduationYear,
    position,
    company,
    mutualConnections,
    mutualCommunities,
    status,
    connectionRequestID,
    updateConnectionStatus,
    setNotification,

    user,
  } = props;

  const [userStatus, setUserStatus] = useState<ProfileState>(status);

  async function requestConnection() {
    const { data } = await makeRequest('POST', '/user/requestConnection', {
      requestUserID: userID,
    });
    if (data['success'] === 1) return setUserStatus('TO');

    setNotification && setNotification('error', 'Failed to send connection request');
  }

  async function respondRequest(accepted: boolean) {
    // setUserStatus(accepted ? 'CONNECTION' : 'PUBLIC');
    // const { data } = await makeRequest('POST', '/user/respondConnection', {
    //   requestID: connectionRequestID,
    //   accepted,
    // });

    // if (data['success'] === 1 && updateConnectionStatus && connectionRequestID)
    if (updateConnectionStatus && connectionRequestID)
      updateConnectionStatus(connectionRequestID);
    // else {
    //   setUserStatus(status);
    //   setNotification &&
    //     setNotification(
    //       'error',
    //       `Failed to ${accepted ? 'accept' : 'remove'} connection request`
    //     );
    // }
  }

  function renderStatus() {
    if (userID === user._id) return;
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
    else
      return (
        <Button className={styles.connectButton} onClick={requestConnection}>
          Connect
        </Button>
      );
  }

  return (
    <Box boxShadow={2} borderRadius={10} className={[style, styles.box].join(' ')}>
      <div className={styles.wrapper}>
        <div className={styles.left}>
          <a href={`/profile/${userID}`}>
            <ProfilePicture
              type="profile"
              currentPicture={profilePic}
              height={70}
              width={70}
              borderRadius={50}
              className={styles.profilePic}
            />
          </a>
          <div className={styles.textContainer}>
            <div className={styles.nameContainer}>
              <a href={`/profile/${userID}`} className={styles.noUnderline}>
                <RSText
                  type="head"
                  size={13}
                  color={colors.second}
                  className={styles.name}
                >
                  {name}
                </RSText>
              </a>
            </div>
            <RSText type="subhead" size={12} color={colors.secondaryText}>
              {university}
              {graduationYear ? ' ' + graduationYear : null}
            </RSText>
            <RSText
              type="subhead"
              size={12}
              color={colors.secondaryText}
              className={styles.work}
            >
              {position ? position : null}
              {position && company ? ', ' : null}
              {company ? company : null}
            </RSText>
            {userID === user._id || (
              <RSText type="subhead" size={12} color={colors.second}>
                {mutualConnections || 0} Mutual Connections |{' '}
                {mutualCommunities || 0} Mutual Communities
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
    user: state.user,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(UserHighlight);
