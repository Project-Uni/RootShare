import React, { useState } from 'react';

import EmojiEmotionsIcon from '@material-ui/icons/EmojiEmotions';
import { makeStyles } from '@material-ui/core/styles';
import { IconButton } from '@material-ui/core';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import ClearIcon from '@material-ui/icons/Clear';

import RSText from '../../../base-components/RSText';
import { colors } from '../../../theme/Colors';
import { UserType } from '../../../helpers/types';
import { UniversityType } from '../../../helpers/types/universityTypes';

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
    marginLeft: 0,
    marginTop: 12,
    marginBottom: -18,
    display: 'inline-block',
    color: colors.primaryText,
  },
  organization: {
    marginLeft: 96,
    color: colors.primaryText,
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
    marginLeft: 10,
    marginRight: 12,
    marginTop: 0,
    marginBottom: -21,
    display: 'inline-block',
  },
  removeSuggestionIcon: {
    color: 'gray',
    fontSize: 14,
  },
  addUserButton: {
    marginRight: -5,
    marginTop: -2,
    color: colors.primaryText,
    marginBottom: -13,
  },
  fadeOut: {
    opacity: 0,
    transition: 'width 0.5s 0.5s, height 0.5s 0.5s, opacity 0.5s',
  },
  fadeIn: {
    opacity: 1,
    transition: 'width 0.5s, height 0.5s, opacity 0.5s 0.5s',
  },
}));

type Props = {
  suggestedUser: UserType;
  removeSuggestion: (userID: string) => void;
};

function SingleConnection(props: Props) {
  const styles = useStyles();

  const [visible, setVisible] = useState(true);

  function requestConnection() {}

  function removeSuggestion() {
    setVisible(false);
    setTimeout(() => {
      props.removeSuggestion(props.suggestedUser._id);
    }, 500);
  }

  const university = props.suggestedUser.university as UniversityType;
  return (
    <div className={styles.wrapper}>
      <div className={visible ? styles.fadeIn : styles.fadeOut}>
        <div className={styles.top}>
          <div>
            <IconButton
              onClick={removeSuggestion}
              className={styles.removeSuggestionButton}
            >
              <ClearIcon className={styles.removeSuggestionIcon} />
            </IconButton>
            <EmojiEmotionsIcon className={styles.picture} />
            <RSText bold size={12} className={styles.name}>
              {`${props.suggestedUser.firstName} ${props.suggestedUser.lastName}`}
            </RSText>
          </div>

          <IconButton className={styles.addUserButton}>
            <AddCircleOutlineIcon />
          </IconButton>
        </div>
        <div className={styles.bottom}>
          <div className={styles.left}>
            <RSText size={12} className={styles.organization}>
              from {university.universityName}
            </RSText>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SingleConnection;
