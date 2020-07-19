import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { FaLock } from 'react-icons/fa';

import RSText from '../../../base-components/RSText';
import { colors } from '../../../theme/Colors';

import PurdueHypeBanner from '../../../images/PurdueHypeAlt.png';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    display: 'flex',
    justifyContent: 'flex-start',
    textAlign: 'left',
    borderBottom: `1px solid ${colors.primary}`,
    paddingBottom: 10,
    paddingTop: 10,
  },
  profilePic: {
    width: 80,
    height: 80,
    borderRadius: 100,
    border: `1px solid ${colors.primary}`,
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
  private?: boolean;
  name: string;
  style?: any;
  description: string;
};

function CommunityOverview(props: Props) {
  const styles = useStyles();

  function renderName() {
    return (
      <a href={`/community/${props.communityID}`} className={styles.noUnderline}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <RSText type="head" size={14} color={colors.primary}>
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
        <RSText color={colors.primary} size={12} type="body">
          Student Organization
        </RSText>
        <RSText
          color={colors.secondaryText}
          size={14}
          type="body"
          className={styles.divider}
        >
          |
        </RSText>
        <RSText color={colors.primary} size={12} type="body">
          7054 Members
        </RSText>
        <RSText
          color={colors.secondaryText}
          size={14}
          type="body"
          className={styles.divider}
        >
          |
        </RSText>
        <RSText color={colors.primary} size={12} type="body">
          56 Mutual
        </RSText>
      </div>
    );
  }

  return (
    <div className={[styles.wrapper, props.style || null].join(' ')}>
      <a href={`/community/${props.communityID}`}>
        <img src={PurdueHypeBanner} className={styles.profilePic} />
      </a>
      <div className={styles.communityBody}>
        {renderName()}
        {renderTypeAndCounts()}
        <RSText
          type="body"
          size={12}
          color={colors.primary}
          className={styles.description}
        >
          {props.description}
        </RSText>
        <RSText color={colors.primary} size={11} italic type="body">
          Joined April 29, 2020
        </RSText>
      </div>
    </div>
  );
}

export default CommunityOverview;
