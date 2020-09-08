import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Button } from '@material-ui/core';

import { FaLock } from 'react-icons/fa';

import { colors } from '../../../theme/Colors';
import RSText from '../../../base-components/RSText';
import ProfilePicture from '../../../base-components/ProfilePicture';

const MAX_DESC_LEN = 200;

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
    border: `1px solid ${colors.bright}`,
  },
  connectButton: {
    background: colors.bright,
    color: colors.primaryText,
    '&:hover': {
      background: colors.primary,
    },
  },
  pendingButton: {
    background: colors.secondaryText,
    color: colors.primaryText,
    '&:hover': {
      background: colors.primary,
    },
  },
  textContainer: {
    marginLeft: 20,
    marginRight: 20,
  },
  type: {
    marginBottom: 6,
  },
  noUnderline: {
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'none',
    },
  },
  lock: {
    marginLeft: 10,
  },
  name: {
    '&:hover': { textDecoration: 'underline' },
  },
}));

type Props = {
  style?: any;
  userID: string;
  communityID: string;
  private?: boolean;
  name: string;
  type:
    | 'Social'
    | 'Business'
    | 'Just for Fun'
    | 'Athletics'
    | 'Student Organization'
    | 'Academic';
  description: string;
  memberCount: number;
  mutualMemberCount: number;
  status: 'JOINED' | 'PENDING' | 'OPEN';
  profilePicture: any;
  admin: string;
};

function CommunityHighlight(props: Props) {
  const styles = useStyles();

  const descSubstr = props.description.substr(0, MAX_DESC_LEN);

  function renderButton() {
    if (props.status === 'OPEN')
      return <Button className={styles.connectButton}>Join</Button>;
    else if (props.status === 'PENDING')
      return <Button className={styles.pendingButton}>Pending</Button>;
    else
      return (
        <RSText color={colors.primary} size={12}>
          {props.userID === props.admin ? 'ADMIN' : 'MEMBER'}
        </RSText>
      );
  }

  return (
    <div className={[styles.wrapper, props.style || null].join(' ')}>
      <div className={styles.left}>
        <a href={`/community/${props.communityID}`}>
          <ProfilePicture
            type="community"
            height={70}
            width={70}
            borderRadius={50}
            borderWidth={1}
            currentPicture={props.profilePicture}
            pictureStyle={styles.profilePic}
          />
        </a>
        <div className={styles.textContainer}>
          <a href={`/community/${props.communityID}`} className={styles.noUnderline}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <RSText
                type="head"
                size={13}
                color={colors.second}
                className={styles.name}
              >
                {props.name}
              </RSText>
              {props.private && (
                <FaLock
                  color={colors.secondaryText}
                  size={13}
                  className={styles.lock}
                />
              )}
            </div>
          </a>
          <RSText
            type="subhead"
            size={12}
            color={colors.fourth}
            className={styles.type}
          >
            {props.type}
          </RSText>
          <RSText
            type="subhead"
            size={12}
            color={colors.secondaryText}
            className={styles.type}
          >
            {props.description !== descSubstr
              ? descSubstr.concat(' ...')
              : props.description}
          </RSText>
          <RSText type="subhead" size={12} color={colors.second}>
            {props.memberCount} Members | {props.mutualMemberCount} Mutual
          </RSText>
        </div>
      </div>
      {/* <div style={{ width: 125 }}> */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {renderButton()}
      </div>
    </div>
  );
}

export default CommunityHighlight;
