import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Button, Box } from '@material-ui/core';

import RSText from '../../../base-components/RSText';
import { colors } from '../../../theme/Colors';

import ProfilePicture from '../../../base-components/ProfilePicture';

import { ProfileState } from '../../../helpers/types';

const useStyles = makeStyles((_: any) => ({
  box: {
    background: colors.primaryText,
  },
  wrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  left: {
    display: 'flex',
    justifyContent: 'flex-start',
    textAlign: 'left',
  },
  profilePic: {
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
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  work: {
    marginBottom: 3,
  },
  noUnderline: {
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'none',
    },
  },
  pendingStatus: {
    background: colors.secondaryText,
  },
}));

type Props = {
  style?: any;
  userID: string;
  profilePic?: string;
  name: string;
  university: string;
  graduationYear?: number;
  position?: string;
  company?: string;
  mutualConnections: number;
  mutualCommunities: number;
  status: ProfileState;
};

function UserHighlight(props: Props) {
  const styles = useStyles();

  function renderStatus() {
    if (props.status === 'PUBLIC')
      return <Button className={styles.connectButton}>Connect</Button>;
    else if (props.status === 'CONNECTION')
      return (
        <RSText color={colors.primary} size={11}>
          CONNECTED
        </RSText>
      );
    else if (props.status === 'PENDING')
      return (
        <RSText
          color={colors.primaryText}
          size={11}
          className={styles.pendingStatus}
        >
          PENDING
        </RSText>
      );
  }

  return (
    <Box
      boxShadow={2}
      borderRadius={10}
      className={[props.style, styles.box].join(' ')}
    >
      <div className={styles.wrapper}>
        <div className={styles.left}>
          <a href={`/profile/${props.userID}`}>
            <ProfilePicture
              type="profile"
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
              {props.university}
              {props.graduationYear ? ' ' + props.graduationYear : null}
            </RSText>
            <RSText
              type="subhead"
              size={12}
              color={colors.secondaryText}
              className={styles.work}
            >
              {props.position ? props.position : null}
              {props.position && props.company ? ', ' : null}
              {props.company ? props.company : null}
            </RSText>
            <RSText type="subhead" size={12} color={colors.second}>
              {props.mutualConnections} Mutual Connections |{' '}
              {props.mutualCommunities} Mutual Communities
            </RSText>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {renderStatus()}
        </div>
      </div>
    </Box>
  );
}

export default UserHighlight;
