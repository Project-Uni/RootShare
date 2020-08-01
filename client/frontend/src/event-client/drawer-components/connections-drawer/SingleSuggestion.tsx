import React, { useState } from 'react';

import EmojiEmotionsIcon from '@material-ui/icons/EmojiEmotions';
import { makeStyles } from '@material-ui/core/styles';
import { IconButton } from '@material-ui/core';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';

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
    marginLeft: 10,
    marginRight: 10,
    marginTop: 12,
    marginBottom: -18,
    display: 'inline-block',
    color: colors.primaryText,
  },
  organization: {
    marginLeft: 54,
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
  addUserButton: {
    marginRight: -5,
    marginTop: -2,
    color: colors.primaryText,
    marginBottom: -13,
  },
}));

type Props = {
  suggestedUser: UserType;
};

function SingleConnection(props: Props) {
  const styles = useStyles();

  const university = props.suggestedUser.university as UniversityType;
  return (
    <div className={styles.wrapper}>
      <div className={styles.top}>
        <div>
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
  );
}

export default SingleConnection;
