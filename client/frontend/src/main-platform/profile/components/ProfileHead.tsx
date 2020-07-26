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

type Props = {
  userID: string;
  name: string;
  university: string;
  graduationYear: number;
  position: string;
  company: string;
  bio: string;
  numConnections: number;
  numMutualConnections: number;
  numCommunities: number;
};

function ProfileHead(props: Props) {
  const styles = useStyles();

  return (
    <div className={styles.wrapper}>
      <div className={styles.headLeft}>
        <RSText type="head" size={24} bold color={colors.primaryText}>
          {props.name}
        </RSText>
        <RSText type="subhead" size={14} color={colors.secondaryText} >
          {props.university + ' ' + props.graduationYear}
        </RSText>
        <RSText type="subhead" size={14} color={colors.secondaryText}>
          {props.position + ', ' + props.company}
        </RSText>
        <RSText
          type="subhead"
          size={14}
          color={colors.primaryText}
          className={styles.bio}
        >
          {props.bio}
        </RSText>
      </div>
      <div className={styles.headRight}>
        <Button variant="contained" className={styles.connectButton} size="large">
          Connect
        </Button>
        <RSText
          type="subhead"
          size={12}
          color={colors.primaryText}
          className={styles.numbers}
        >
          {props.numConnections} Connections
        </RSText>
        <RSText
          type="subhead"
          size={12}
          color={colors.primaryText}
          className={styles.numbers}
        >
          {props.numMutualConnections} Mutual
        </RSText>
        <RSText
          type="subhead"
          size={12}
          color={colors.primaryText}
          className={styles.numbers}
        >
          {props.numCommunities} Communities
        </RSText>
      </div>
    </div>
  );
}

export default ProfileHead;
