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
import { capitalizeFirstLetter } from '../../../helpers/functions';
import Theme from '../../../theme/Theme';
import { putUpdateUserConnection } from '../../../api';
import { RSLink } from '../../../main-platform/reusable-components';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    display: 'flex',
    background: Theme.white,
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
    color: Theme.secondaryText,
    wordWrap: 'break-word',
    maxWidth: 200,
  },
  name: {
    display: 'inline-block',
    color: Theme.primaryText,
    wordWrap: 'break-word',
    maxWidth: 200,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
      color: Theme.primaryText,
    },
  },
  removeSuggestionButton: {
    marginRight: 5,
    marginBottom: -21,
    display: 'inline-block',
  },
  removeSuggestionIcon: {
    color: Theme.primary,
    fontSize: 14,
  },
  removeButton: {
    color: Theme.altText,
    background: Theme.primary,
    height: 27,
    marginTop: 7,
  },
  acceptButton: {
    color: Theme.altText,
    background: Theme.bright,
    height: 27,
    marginTop: 7,
    marginLeft: 7,
  },
  fadeOut: {
    opacity: 0,
    transition: 'opacity 0.5s',
  },
  confirmation: {
    color: Theme.success,
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

  const fromUser = props.connectionRequest.from as UserType;

  function respondRequest(accepted: boolean) {
    const requestID = props.connectionRequest._id;
    putUpdateUserConnection(accepted ? 'accept' : 'reject', fromUser._id);

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
        props.addConnection(fromUser);
      }, 1000);
    }
  }

  function renderPending() {
    const requestUserUniversity = fromUser.university as UniversityType;
    const universityName = requestUserUniversity.nickname
      ? requestUserUniversity.nickname
      : requestUserUniversity.universityName;

    return (
      <div className={styles.wrapper}>
        <div className={styles.left}>
          <RSLink href={`/profile/${fromUser._id}`}>
            <ProfilePicture
              type="profile"
              className={styles.picture}
              editable={false}
              height={35}
              width={35}
              borderRadius={35}
              currentPicture={fromUser.profilePicture}
            />
          </RSLink>
        </div>
        <div className={styles.center}>
          <RSLink href={`/profile/${fromUser._id}`}>
            <RSText bold size={12} className={styles.name}>
              {`${fromUser.firstName} ${fromUser.lastName}`}
            </RSText>
          </RSLink>

          <RSText size={11} italic={true} className={styles.organization}>
            {universityName} | {capitalizeFirstLetter(fromUser.accountType)}
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
