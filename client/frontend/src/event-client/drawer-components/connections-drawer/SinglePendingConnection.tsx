import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { Button } from '@material-ui/core';

import RSText from '../../../base-components/RSText';
import { colors } from '../../../theme/Colors';
import ProfilePicture from '../../../base-components/ProfilePicture';

import {
  ConnectionRequestType,
  UserType,
  UniversityType,
} from '../../../helpers/types';
import { makeRequest, capitalizeFirstLetter } from '../../../helpers/functions';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    display: 'flex',
    background: colors.secondary,
    paddingTop: 5,
    paddingBottom: 5,
  },
  left: {},
  center: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    marginLeft: 10,
  },
  top: {},
  bottom: {},
  right: {
    justifySelf: 'end',
    marginRight: 8,
  },
  picture: {
    marginLeft: 4,
    marginTop: 2,
  },
  organization: {
    color: colors.secondaryText,
    wordWrap: 'break-word',
    maxWidth: 200,
  },
  name: {
    display: 'inline-block',
    color: colors.primaryText,
    wordWrap: 'break-word',
    maxWidth: 200,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
      color: colors.primaryText,
    },
  },
  removeSuggestionButton: {
    marginRight: 5,
    marginBottom: -21,
    display: 'inline-block',
  },
  removeSuggestionIcon: {
    color: 'gray',
    fontSize: 14,
  },
  removeButton: {
    color: colors.primaryText,
    background: 'gray',
    height: 27,
    marginTop: 7,
  },
  acceptButton: {
    color: colors.primaryText,
    background: colors.bright,
    height: 27,
    marginTop: 7,
    marginLeft: 7,
  },
  fadeOut: {
    opacity: 0,
    transition: 'opacity 0.5s',
  },
  confirmation: {
    color: colors.success,
    height: 31, //TODO: Set this to dynamically mimic height of wrapper?
    marginTop: 10,
    marginLeft: 38,
  },
}));

type Props = {
  removePending: (requestID: string) => void;
  addConnection: (newConnection: UserType) => void;
  connectionRequest: ConnectionRequestType;
  accessToken: string;
  refreshToken: string;
};

function SinglePendingConnection(props: Props) {
  const styles = useStyles();

  const [visible, setVisible] = useState(true);
  const [accepted, setAccepted] = useState(false);

  function respondRequest(accepted: boolean) {
    const requestID = props.connectionRequest._id;
    makeRequest(
      'POST',
      '/user/respondConnection',
      {
        requestID,
        accepted,
      },
      true,
      props.accessToken,
      props.refreshToken
    );

    if (!accepted) {
      setVisible(false);
      setTimeout(() => {
        props.removePending(requestID);
      }, 500);
    } else {
      setAccepted(true);
      setTimeout(() => {
        setVisible(false);
      }, 300);
      setTimeout(() => {
        props.removePending(requestID);
        props.addConnection(props.connectionRequest.from as UserType);
      }, 1000);
    }
  }

  function renderPending() {
    const requestUser = props.connectionRequest.from as UserType;
    const requestUserUniversity = requestUser.university as UniversityType;

    return (
      <div className={styles.wrapper}>
        <div className={styles.left}>
          <a href={`/profile/${requestUser._id}`}>
            <ProfilePicture
              type="profile"
              className={styles.picture}
              editable={false}
              height={35}
              width={35}
              borderRadius={35}
              currentPicture={requestUser.profilePicture}
            />
          </a>
        </div>
        <div className={styles.center}>
          <a href={`/profile/${requestUser._id}`}>
            <RSText bold size={12} className={styles.name}>
              {`${requestUser.firstName} ${requestUser.lastName}`}
            </RSText>
          </a>

          <RSText size={11} italic={true} className={styles.organization}>
            {requestUserUniversity.universityName} |{' '}
            {capitalizeFirstLetter(requestUser.accountType)}
          </RSText>
        </div>
        <div className={styles.right}>
          <Button
            className={styles.removeButton}
            size="small"
            onClick={() => respondRequest(false)}
          >
            Remove
          </Button>
          <Button
            className={styles.acceptButton}
            size="small"
            onClick={() => respondRequest(true)}
          >
            Accept
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={visible ? '' : styles.fadeOut}>
      {accepted ? (
        <div className={styles.wrapper}>
          <RSText className={styles.confirmation}>Connection Added!</RSText>
        </div>
      ) : (
        renderPending()
      )}
    </div>
  );
}
export default SinglePendingConnection;
