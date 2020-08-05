import React, { useState } from 'react';

import EmojiEmotionsIcon from '@material-ui/icons/EmojiEmotions';
import { makeStyles } from '@material-ui/core/styles';
import { IconButton } from '@material-ui/core';
import { FaEllipsisH } from 'react-icons/fa';

import RSText from '../../../base-components/RSText';
import { colors } from '../../../theme/Colors';
import { UserType, UniversityType } from '../../../helpers/types';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    background: colors.secondary,
    paddingBottom: 4,
  },
  top: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  left: {},
  right: {},
  picture: {
    margin: 10,
    marginTop: 12,
    marginBottom: -16,
    display: 'inline-block',
    color: colors.primaryText,
  },
  organization: {
    marginLeft: 54,
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
  ellipsis: {
    margin: 1.5,
    marginBottom: -7,
  },
}));

type Props = {
  connectedUser: UserType;
};

function SingleConnection(props: Props) {
  const styles = useStyles();

  const university = props.connectedUser.university as UniversityType;
  return (
    <div className={styles.wrapper}>
      <div className={styles.top}>
        <div>
          <EmojiEmotionsIcon className={styles.picture} />
          <RSText bold size={12} className={styles.name}>
            {`${props.connectedUser.firstName} ${props.connectedUser.lastName}`}
          </RSText>
        </div>
        <IconButton className={styles.ellipsis}>
          <FaEllipsisH size={12} color={colors.secondaryText} />
        </IconButton>
      </div>
      <div className={styles.bottom}>
        <div className={styles.left}>
          <RSText size={11} italic={true} className={styles.organization}>
            {university.universityName}
          </RSText>
        </div>
      </div>
    </div>
  );
}

export default SingleConnection;
