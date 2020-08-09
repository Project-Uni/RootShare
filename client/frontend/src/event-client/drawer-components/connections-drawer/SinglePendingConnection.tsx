import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import EmojiEmotionsIcon from '@material-ui/icons/EmojiEmotions';
import { Button } from '@material-ui/core';

import RSText from '../../../base-components/RSText';
import { colors } from '../../../theme/Colors';
import {
  ConnectionRequestType,
  UserType,
  UniversityType,
} from '../../../helpers/types';
import { makeRequest } from '../../../helpers/functions';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    display: 'flex',
    background: colors.secondary,
    paddingBottom: 7,
  },
  left: {
    display: 'flex',
    flexDirection: 'column',
  },
  top: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  bottom: {
    display: 'flex',
    justifyContent: 'space-between',
    margin: 0,
    marginTop: -20,
  },
  right: {
    marginLeft: 'auto',
  },
  picture: {
    marginLeft: 4,
    marginTop: 12,
    marginBottom: -18,
    display: 'inline-block',
    color: colors.primaryText,
  },
  organization: {
    marginTop: 20,
    marginLeft: 39,
    color: colors.secondaryText,
    wordWrap: 'break-word',
    maxWidth: 196,
  },
  name: {
    marginLeft: 10,
    marginTop: 5,
    display: 'inline-block',
    color: colors.primaryText,
    wordWrap: 'break-word',
    maxWidth: 196,
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
  connectButton: {
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

  function renderPending() {
    const requestUser = props.connectionRequest.from as UserType;
    const requestUserUniversity = requestUser.university as UniversityType;

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

    return (
      <div className={styles.wrapper}>
        <div className={styles.left}>
          <div className={styles.top}>
            <EmojiEmotionsIcon className={styles.picture} />
            <RSText bold size={12} className={styles.name}>
              {`${requestUser.firstName} ${requestUser.lastName}`}
            </RSText>
          </div>
          <div className={styles.bottom}>
            <RSText size={11} italic={true} className={styles.organization}>
              {requestUserUniversity.universityName}
            </RSText>
          </div>
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
            className={styles.connectButton}
            size="small"
            onClick={() => respondRequest(true)}
          >
            Connect
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
