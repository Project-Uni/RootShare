import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { FaLock } from 'react-icons/fa';

import { CommunityType } from '../../../helpers/types';
import { colors } from '../../../theme/Colors';

import RSText from '../../../base-components/RSText';
import ProfilePicture from '../../../base-components/ProfilePicture';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    display: 'flex',
    justifyContent: 'flex-start',
    textAlign: 'left',
    paddingBottom: 20,
    paddingTop: 20,
    background: colors.primaryText,
    borderRadius: 10,
    paddingLeft: 20,
    paddingRight: 20,
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
  countsAndStatusDiv: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  status: {
    padding: '7px 10px',
    borderRadius: 4,
  },
  joinedStatus: {
    background: colors.primary,
  },
  pendingStatus: {
    background: colors.secondaryText,
  },
}));

type Props = {
  communityID: string;
  name: string;
  description: string;
  private?: boolean;
  type: CommunityType;
  memberCount: number;
  mutualMemberCount: number;
  profilePicture?: any;
  style?: any;
  status: 'joined' | 'pending';
};

function CommunityOverview(props: Props) {
  const styles = useStyles();

  function renderName() {
    return (
      <a href={`/community/${props.communityID}`} className={styles.noUnderline}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <RSText type="head" size={14} color={colors.second}>
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
        <RSText color={colors.second} size={12} type="body">
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
        <RSText color={colors.second} size={12} type="body">
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
        <RSText color={colors.second} size={12} type="body">
          {props.mutualMemberCount} Mutual
        </RSText>
      </div>
    );
  }

  return (
    <div className={[styles.wrapper, props.style || null].join(' ')}>
      <a href={`/community/${props.communityID}`}>
        <ProfilePicture
          type="community"
          currentPicture={props.profilePicture}
          height={80}
          width={80}
          borderRadius={60}
        />
      </a>
      <div className={styles.communityBody}>
        {renderName()}
        <div className={styles.countsAndStatusDiv}>
          {renderTypeAndCounts()}
          <RSText
            type="body"
            size={12}
            color={colors.primaryText}
            className={[
              styles.status,
              props.status === 'joined' ? styles.joinedStatus : styles.pendingStatus,
            ].join(' ')}
          >
            {props.status === 'joined' ? 'MEMBER' : 'PENDING'}
          </RSText>
        </div>

        <RSText
          type="body"
          size={12}
          color={colors.secondaryText}
          className={styles.description}
        >
          {props.description}
        </RSText>
        {/* NOTE - Hiding this for now because our current database strategy doesn't support this */}
        {/* <RSText color={colors.second} size={11} type="body">
          Joined {props.joinedDate}
        </RSText> */}
      </div>
    </div>
  );
}

export default CommunityOverview;
