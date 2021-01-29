import React, { useState, useEffect } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import { Button } from '@material-ui/core';

import RSText from '../../../base-components/RSText';
import { colors } from '../../../theme/Colors';
import ProfilePicture from '../../../base-components/ProfilePicture';

import { UserType } from '../../../helpers/types';
import { UniversityType } from '../../../helpers/types/universityTypes';
import { makeRequest, capitalizeFirstLetter } from '../../../helpers/functions';
import Theme from '../../../theme/Theme';
import { putUpdateUserConnection } from '../../../api';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    display: 'flex',
    background: Theme.white,
    paddingTop: 5,
    paddingBottom: 5,
  },
  left: {},
  center: {
    display: 'flex',
    flexDirection: 'column',
    marginLeft: 10,
  },
  top: {},
  bottom: {},
  right: {
    marginLeft: 'auto',
  },
  picture: {
    marginLeft: 4,
    marginTop: 2,
  },
  mutual: {
    color: Theme.secondaryText,
    wordWrap: 'break-word',
    maxWidth: 200,
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
  removeButton: {
    color: Theme.altText,
    background: Theme.primary,
    height: 27,
    marginTop: 7,
    '&:hover': {
      background: Theme.primaryHover,
    },
  },
  connectButton: {
    color: Theme.altText,
    background: Theme.bright,
    height: 27,
    marginTop: 7,
    marginLeft: 7,
    '&:hover': {
      background: Theme.brightHover,
    },
  },
  fadeOut: {
    opacity: 0,
    transition: 'opacity 0.5s',
  },
  confirmationWrapper: {
    display: 'flex',
  },
  confirmation: {
    color: Theme.success,
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
    putUpdateUserConnection('connect', props.suggestedUser._id);

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
    const universityName = university.nickname
      ? university.nickname
      : university.universityName;

    return (
      <div id="suggestionWrapper" className={styles.wrapper}>
        <div className={styles.left}>
          <a href={`/profile/${props.suggestedUser._id}`}>
            <ProfilePicture
              type="profile"
              className={styles.picture}
              editable={false}
              height={35}
              width={35}
              borderRadius={35}
              currentPicture={props.suggestedUser.profilePicture}
            />
          </a>
        </div>
        <div className={styles.center}>
          <a href={`/profile/${props.suggestedUser._id}`}>
            <RSText bold size={12} className={styles.name}>
              {`${props.suggestedUser.firstName} ${props.suggestedUser.lastName}`}
            </RSText>
          </a>

          <RSText size={11} italic className={styles.organization}>
            {university.universityName} |{' '}
            {capitalizeFirstLetter(props.suggestedUser.accountType)}
          </RSText>

          {/* TODO: add mutuals to suggestions and pending with the following format:
              27 {people icon} | 4 {community icon}
          */}
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
