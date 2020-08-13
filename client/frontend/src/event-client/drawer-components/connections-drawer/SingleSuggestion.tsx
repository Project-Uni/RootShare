import React, { useState, useEffect } from 'react';

import EmojiEmotionsIcon from '@material-ui/icons/EmojiEmotions';
import { makeStyles } from '@material-ui/core/styles';
import { Button } from '@material-ui/core';

import RSText from '../../../base-components/RSText';
import { colors } from '../../../theme/Colors';

import { UserType } from '../../../helpers/types';
import { UniversityType } from '../../../helpers/types/universityTypes';
import { makeRequest, capitalizeFirstLetter } from '../../../helpers/functions';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    display: 'flex',
    background: colors.secondary,
    paddingBottom: 7,
  },
  left: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
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
    marginLeft: 38,
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
  confirmationWrapper: {
    display: 'flex',
  },
  confirmation: {
    color: colors.success,
    marginTop: 'auto',
    marginBottom: 'auto',
    marginLeft: 40,
  },
}));

type Props = {
  suggestedUser: UserType;
  removeSuggestion: (userID: string) => void;
  accessToken: string;
  refreshToken: string;
};

function SingleSuggestion(props: Props) {
  const styles = useStyles();

  const [visible, setVisible] = useState(true);
  const [requested, setRequested] = useState(false);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const wrapperElem = document.getElementById('suggestionWrapper');
    if (wrapperElem) setHeight(wrapperElem.offsetHeight);
  }, [document.getElementById('suggestionWrapper')?.offsetHeight]);

  function requestConnection() {
    makeRequest(
      'POST',
      '/user/requestConnection',
      {
        requestID: props.suggestedUser._id,
      },
      true,
      props.accessToken,
      props.refreshToken
    );

    setRequested(true);
    removeSuggestion();
  }

  function removeSuggestion() {
    setVisible(false);
    setTimeout(() => {
      props.removeSuggestion(props.suggestedUser._id);
    }, 500);
  }

  function renderSuggestion() {
    const university = props.suggestedUser.university as UniversityType;

    return (
      <div id="suggestionWrapper" className={styles.wrapper}>
        <div className={styles.left}>
          <div className={styles.top}>
            <EmojiEmotionsIcon className={styles.picture} />
            <RSText bold size={12} className={styles.name}>
              {`${props.suggestedUser.firstName} ${props.suggestedUser.lastName}`}
            </RSText>
          </div>
          <div className={styles.bottom}>
            <RSText size={11} italic={true} className={styles.organization}>
              {university.universityName} |{' '}
              {capitalizeFirstLetter(props.suggestedUser.accountType)}
            </RSText>
          </div>
        </div>
        <div className={styles.right}>
          <Button
            className={styles.removeButton}
            size="small"
            onClick={removeSuggestion}
          >
            Remove
          </Button>
          <Button
            className={styles.connectButton}
            size="small"
            onClick={requestConnection}
          >
            Connect
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={visible ? '' : styles.fadeOut}>
      {requested ? (
        <div className={styles.confirmationWrapper} style={{ height: height }}>
          <RSText className={styles.confirmation}>Request Sent!</RSText>
        </div>
      ) : (
        renderSuggestion()
      )}
    </div>
  );
}

export default SingleSuggestion;
