import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { ReniHeadshot } from '../../../images/team';
import RSText from '../../../base-components/RSText';
import { colors } from '../../../theme/Colors';
import { Button } from '@material-ui/core';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: colors.secondary,
    borderRadius: 10,
    padding: 15,
  },
  left: {
    display: 'flex',
    justifyContent: 'flex-start',
    textAlign: 'left',
  },
  profilePic: {
    height: 70,
    width: 70,
    borderRadius: 50,
    border: `1px solid ${colors.primaryText}`,
  },
  connectButton: {
    background: colors.bright,
    color: colors.primaryText,
    '&:hover': {
      background: colors.primary,
    },
  },
  textContainer: {
    marginLeft: 20,
  },
  name: {
    marginBottom: 6,
  },
  noUnderline: {
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'none',
    },
  },
}));

type Props = {
  style?: any;
  userID: string;
};

function UserHighlight(props: Props) {
  const styles = useStyles();
  return (
    <div className={[styles.wrapper, props.style || null].join(' ')}>
      <div className={styles.left}>
        <a href={`/profile/${props.userID}`}>
          <img src={ReniHeadshot} className={styles.profilePic} />
        </a>
        <div className={styles.textContainer}>
          <a href={`/profile/${props.userID}`} className={styles.noUnderline}>
            <RSText
              type="head"
              size={13}
              color={colors.primaryText}
              className={styles.name}
            >
              Reni Patel
            </RSText>
          </a>
          <RSText type="subhead" size={12} color={colors.primaryText}>
            Purdue 2020
          </RSText>
          <RSText type="subhead" size={12} color={colors.primaryText}>
            Head of Alumni Relations, RootShare
          </RSText>
          <RSText type="subhead" size={12} color={colors.secondaryText}>
            178 Mutual Connections | 6 Mutal Organizations
          </RSText>
        </div>
      </div>
      <div>
        <Button className={styles.connectButton}>Connect</Button>
      </div>
    </div>
  );
}

export default UserHighlight;
