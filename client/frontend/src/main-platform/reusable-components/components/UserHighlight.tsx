import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Button } from '@material-ui/core';

import RSText from '../../../base-components/RSText';
import { colors } from '../../../theme/Colors';

import ProfilePicture from '../../../base-components/ProfilePicture';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: colors.primaryText,
    borderRadius: 1,
    padding: 15,
  },
  left: {
    display: 'flex',
    justifyContent: 'flex-start',
    textAlign: 'left',
  },
  profilePic: {
    // height: 70,
    // width: 70,
    // borderRadius: 50,
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
    marginBottom: 3,
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
  profilePic?: any;
  name: string;
  university: string;
  graduationYear: number;
  position: string;
  company: string;
  mutualConnections: number;
  mutualCommunities: number;
  connected?: boolean;
};

function UserHighlight(props: Props) {
  const styles = useStyles();

  return (
    <div className={[styles.wrapper, props.style || null].join(' ')}>
      <div className={styles.left}>
        <a href={`/profile/${props.userID}`}>
          <ProfilePicture
            currentPicture={props.profilePic}
            height={70}
            width={70}
            borderRadius={50}
            className={styles.profilePic}
          />
        </a>
        <div className={styles.textContainer}>
          <a href={`/profile/${props.userID}`} className={styles.noUnderline}>
            <RSText
              type="head"
              size={13}
              color={colors.second}
              className={styles.name}
            >
              {props.name}
            </RSText>
          </a>
          <RSText type="subhead" size={12} color={colors.secondaryText}>
            {props.university + ' ' + props.graduationYear}
          </RSText>
          <RSText
            type="subhead"
            size={12}
            color={colors.secondaryText}
            className={styles.name}
          >
            {props.position ? props.position : null}
            {props.position && props.company ? ', ' : null}
            {props.company ? props.company : null}
          </RSText>
          <RSText type="subhead" size={12} color={colors.second}>
            {props.mutualConnections} Mutual Connections | {props.mutualCommunities}{' '}
            Mutual Communities
          </RSText>
        </div>
      </div>
      <div>
        {!props.connected ? (
          <Button className={styles.connectButton}>Connect</Button>
        ) : (
          <RSText color={colors.primaryText} size={11}>
            CONNECTED
          </RSText>
        )}
      </div>
    </div>
  );
}

export default UserHighlight;
