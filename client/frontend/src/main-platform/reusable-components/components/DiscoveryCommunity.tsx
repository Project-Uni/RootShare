import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { IconButton, Button } from '@material-ui/core';

import { colors } from '../../../theme/Colors';
import RSText from '../../../base-components/RSText';
import BabyBoilersBanner from '../../../images/PurdueHypeAlt.png';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    marginTop: 15,
    borderBottom: `1px solid ${colors.secondaryText}`,
    paddingBottom: 15,
    display: 'flex',
    justifyContent: 'flex-start',
  },
  profilePic: {
    height: 80,
    width: 80,
    borderRadius: 80,
    marginRight: 10,
  },
  body: {
    flex: 1,
  },
  top: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  button: {
    color: colors.primaryText,
    marginTop: 10,
    '&:hover': {
      background: colors.primary,
    },
  },
  joinButton: {
    background: colors.bright,
  },
  pendingButton: {
    background: colors.secondaryText,
  },
  left: {},
  joinedText: {
    marginTop: 10,
  },
  noUnderline: {
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
      color: colors.primaryText,
    },
  },
}));

type Props = {
  communityID: string;
  status: 'JOINED' | 'PENDING' | 'OPEN';
  name: string;
  numMembers: number;
  numMutual: number;
};

function DiscoveryCommunity(props: Props) {
  const styles = useStyles();

  function renderButton() {
    if (props.status === 'OPEN')
      return (
        <Button
          className={[styles.button, styles.joinButton].join(' ')}
          size="small"
        >
          Join
        </Button>
      );
    else if (props.status === 'PENDING')
      return (
        <Button
          className={[styles.button, styles.pendingButton].join(' ')}
          size="small"
        >
          Pending
        </Button>
      );
    else
      return (
        <RSText color={colors.primaryText} size={12} className={styles.joinedText}>
          MEMBER
        </RSText>
      );
  }

  return (
    <div className={styles.wrapper}>
      <a href={`/community/${props.communityID}`}>
        <img src={BabyBoilersBanner} className={styles.profilePic} />
      </a>
      <div className={styles.body}>
        <div className={styles.top}>
          <div className={styles.left}>
            <a
              href={`/community/${props.communityID}`}
              className={styles.noUnderline}
            >
              <RSText type="body" bold size={13} color={colors.primaryText}>
                {props.name}
              </RSText>
            </a>

            <RSText type="body" size={11} color={colors.secondaryText}>
              {props.numMembers} Members
            </RSText>
            <RSText type="body" size={11} color={colors.secondaryText}>
              {props.numMutual} Mutual
            </RSText>
          </div>

          <IconButton onClick={() => {}}>
            <RSText type="subhead" color={colors.primaryText} size={12}>
              X
            </RSText>
          </IconButton>
        </div>
        {renderButton()}
      </div>
    </div>
  );
}

export default DiscoveryCommunity;
