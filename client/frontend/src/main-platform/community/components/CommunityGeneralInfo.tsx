import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { FaLock } from 'react-icons/fa';

import RSText from '../../../base-components/RSText';
import { colors } from '../../../theme/Colors';
import { Button } from '@material-ui/core';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    textAlign: 'left',
    marginLeft: 50,
    marginRight: 50,
  },
  top: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  left: {},
  right: {
    marginTop: -50,
  },
  divider: {
    marginLeft: 10,
    marginRight: 10,
  },
  lockIcon: {
    marginLeft: 15,
  },
  button: {
    marginBottom: 15,
  },
  joinButton: {
    paddingLeft: 45,
    paddingRight: 45,
    background: colors.bright,
    color: colors.primaryText,
    '&:hover': {
      background: colors.primary,
    },
  },
  pendingButton: {
    paddingLeft: 30,
    paddingRight: 30,
    background: colors.secondaryText,
    color: colors.primaryText,
    '&:hover': {
      background: colors.primary,
    },
  },
  joinedButton: {
    paddingLeft: 30,
    paddingRight: 30,
    background: colors.primary,
    color: colors.primaryText,
    '&:hover': {
      background: colors.secondaryText,
    },
  },
}));

type Props = {
  status: 'JOINED' | 'PENDING' | 'OPEN';
  name: string;
  numMembers: number;
  numMutual: number;
  type:
    | 'Social'
    | 'Business'
    | 'Just for Fun'
    | 'Athletics'
    | 'Student Organization'
    | 'Academic';
  private?: boolean;
};

function CommunityGeneralInfo(props: Props) {
  const styles = useStyles();

  function renderButton() {
    if (props.status === 'OPEN')
      return (
        <Button
          className={[styles.button, styles.joinButton].join(' ')}
          size="large"
        >
          Join
        </Button>
      );
    else if (props.status === 'PENDING')
      return (
        <Button
          className={[styles.button, styles.pendingButton].join(' ')}
          size="large"
        >
          Pending
        </Button>
      );
    else
      return (
        <Button
          size="large"
          className={[styles.button, styles.joinedButton].join(' ')}
        >
          MEMBER
        </Button>
      );
  }
  return (
    <div className={styles.wrapper}>
      <div className={styles.top}>
        <div className={styles.left}>
          <RSText type="head" size={22} color={colors.primary}>
            {props.name}
            {props.private && (
              <FaLock
                color={colors.secondaryText}
                size={20}
                className={styles.lockIcon}
              />
            )}
          </RSText>
          <RSText size={16} color={colors.secondaryText} type="body">
            {props.type}
          </RSText>
        </div>
        <div className={styles.right}>
          {renderButton()}
          <RSText type="body" size={14} color={colors.primary} bold>
            {props.numMembers} Members
          </RSText>
          <RSText type="body" size={14} color={colors.primary} bold>
            {props.numMutual} Mutual
          </RSText>
        </div>
      </div>
    </div>
  );
}

export default CommunityGeneralInfo;
