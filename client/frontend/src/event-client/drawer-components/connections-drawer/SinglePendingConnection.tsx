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
    background: colors.secondary,
    paddingBottom: 10,
    paddingTop: 5,
    // borderBottomStyle: 'solid',
    // borderBottomColor: 'gray',
    // borderBottomWidth: 1,
  },
  top: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  left: {},
  right: {},
  picture: {
    marginLeft: 4,
    marginTop: 12,
    marginBottom: -18,
    display: 'inline-block',
    color: colors.primaryText,
  },
  organization: {
    marginLeft: 39,
    color: colors.secondaryText,
    marginTop: 10,
  },
  bottom: {
    display: 'flex',
    justifyContent: 'space-between',
    margin: 0,
    marginTop: -20,
  },
  name: {
    marginRight: 4,
    marginBottom: 10,
    marginTop: -50,
    marginLeft: 10,
    display: 'inline-block',
    color: colors.primaryText,
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
    height: 31,
    marginTop: 10,
    marginLeft: 38,
  },
}));

type Props = {
  removePending: (requestID: string) => void;
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
        }, 1000);
      }
    }

    return (
      <div>
        <div className={styles.top}>
          <div>
            <EmojiEmotionsIcon className={styles.picture} />
            <RSText bold size={12} className={styles.name}>
              {`${requestUser.firstName} ${requestUser.lastName}`}
            </RSText>
          </div>

          <div>
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
        <div className={styles.bottom}>
          <div className={styles.left}>
            <RSText size={11} italic={true} className={styles.organization}>
              {requestUserUniversity.universityName}
            </RSText>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={visible ? '' : styles.fadeOut}>
        {accepted ? (
          <RSText className={styles.confirmation}>Connection Added!</RSText>
        ) : (
          renderPending()
        )}
      </div>
    </div>
  );
}

export default SinglePendingConnection;
