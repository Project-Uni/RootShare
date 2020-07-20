import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { FaLock } from 'react-icons/fa';

import RSText from '../../../base-components/RSText';
import { colors } from '../../../theme/Colors';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    display: 'flex',
    justifyContent: 'flex-start',
    textAlign: 'left',
    paddingBottom: 20,
    paddingTop: 20,
    background: colors.secondary,
    borderRadius: 10,
    paddingLeft: 20,
    paddingRight: 20,
  },
  profilePic: {
    width: 80,
    height: 80,
    borderRadius: 100,
    border: `1px solid ${colors.primaryText}`,
  },
  communityBody: {
    flex: 1,
    marginLeft: 20,
    marginRight: 20,
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
  divider: {
    marginLeft: 10,
    marginRight: 10,
  },
  secondRow: {
    display: 'flex',
    alignItems: 'center',
  },
  description: {
    marginTop: 10,
    marginBottom: 8,
  },
}));

type Props = {
  communityID: string;
  name: string;
  description: string;
  private?: boolean;
  type:
    | 'Social'
    | 'Business'
    | 'Just for Fun'
    | 'Athletics'
    | 'Student Organization'
    | 'Academic';
  memberCount: number;
  mutualMemberCount: number;
  profilePicture: any;
  style?: any;
  joinedDate: string;
};

function CommunityOverview(props: Props) {
  const styles = useStyles();

  function renderName() {
    return (
      <a href={`/community/${props.communityID}`} className={styles.noUnderline}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <RSText type="head" size={14} color={colors.primaryText}>
            {props.name}
          </RSText>
          {props.private && (
            <FaLock color={colors.secondaryText} size={14} className={styles.lock} />
          )}
        </div>
      </a>
    );
  }

  function renderTypeAndCounts() {
    return (
      <div className={styles.secondRow}>
        <RSText color={colors.primaryText} size={12} type="body">
          {props.type}
        </RSText>
        <RSText
          color={colors.secondaryText}
          size={14}
          type="body"
          className={styles.divider}
        >
          |
        </RSText>
        <RSText color={colors.primaryText} size={12} type="body">
          {props.memberCount} Members
        </RSText>
        <RSText
          color={colors.secondaryText}
          size={14}
          type="body"
          className={styles.divider}
        >
          |
        </RSText>
        <RSText color={colors.primaryText} size={12} type="body">
          {props.mutualMemberCount} Mutual
        </RSText>
      </div>
    );
  }

  return (
    <div className={[styles.wrapper, props.style || null].join(' ')}>
      <a href={`/community/${props.communityID}`}>
        <img src={props.profilePicture} className={styles.profilePic} />
      </a>
      <div className={styles.communityBody}>
        {renderName()}
        {renderTypeAndCounts()}
        <RSText
          type="body"
          size={12}
          color={colors.secondaryText}
          className={styles.description}
        >
          {props.description}
        </RSText>
        <RSText color={colors.primaryText} size={11} italic type="body">
          Joined {props.joinedDate}
        </RSText>
      </div>
    </div>
  );
}

export default CommunityOverview;
