import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Button } from '@material-ui/core';

import RSText from '../../../base-components/RSText';
import { colors } from '../../../theme/Colors';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    marginLeft: 50,
    marginRight: 50,
  },
  headLeft: {
    flex: 1,
    textAlign: 'left',
    marginRight: 50,
  },
  headRight: {
    textAlign: 'left',
    width: 125,
  },
  connectButton: {
    color: colors.primaryText,
    background: colors.bright,
    paddingLeft: 25,
    paddingRight: 25,
    marginBottom: 15,
    '&:hover': {
      background: colors.primary,
    },
  },
  bio: {
    marginTop: 7,
  },
  numbers: {
    marginTop: 1,
  },
}));

type Props = {};

function ProfileHead(props: Props) {
  const styles = useStyles();

  return (
    <div className={styles.wrapper}>
      <div className={styles.headLeft}>
        <RSText type="head" size={24} bold color={colors.primary}>
          Dhruv Patel
        </RSText>
        <RSText type="subhead" size={14} color={colors.secondaryText}>
          Purdue 2020
        </RSText>
        <RSText type="subhead" size={14} color={colors.secondaryText}>
          Chief Operating Officer, RootShare
        </RSText>
        <RSText
          type="subhead"
          size={14}
          color={colors.primary}
          className={styles.bio}
        >
          Hello! My name is Dhruv Patel and I am a big fan of Roots! I love roots so
          much that I started a company where we can all share our roots. I hope you
          guys enjoy my profile! Big Root guy here.
        </RSText>
      </div>
      <div className={styles.headRight}>
        <Button variant="contained" className={styles.connectButton} size="large">
          Connect
        </Button>
        <RSText
          type="subhead"
          size={12}
          color={colors.secondary}
          italic
          className={styles.numbers}
        >
          804 Connections
        </RSText>
        <RSText
          type="subhead"
          size={12}
          color={colors.secondary}
          italic
          className={styles.numbers}
        >
          34 Mutual
        </RSText>
        <RSText
          type="subhead"
          size={12}
          color={colors.secondary}
          italic
          className={styles.numbers}
        >
          6 Communities
        </RSText>
      </div>
    </div>
  );
}

export default ProfileHead;
