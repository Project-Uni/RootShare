import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { Button } from '@material-ui/core';
import { FaLock } from 'react-icons/fa';

import { colors } from '../../../theme/Colors';
import theme from '../../../theme/Theme';
import RSText from '../../../base-components/RSText';
import ProfilePicture from '../../../base-components/ProfilePicture';

import { makeRequest } from '../../../helpers/functions';
import { CommunityType } from '../../../helpers/types';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    marginTop: 15,
    borderBottom: `1px solid ${theme.dark}`,
    paddingBottom: 15,
  },
  lastWrapper: {
    marginTop: 15,
    paddingBottom: 20,
  },
  communityInfo: {
    display: 'flex',
    justifyContent: 'flex-start',
  },
  profilePic: {
    height: 80,
    width: 80,
    borderRadius: 80,
    marginRight: 10,
  },
  textContainer: {
    marginLeft: 10,
  },
  removeButton: {
    color: theme.altText,
    background: theme.primary,
    marginRight: 7,
    '&:hover': {
      background: theme.primaryHover,
    },
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  lockIcon: {
    marginRight: 7,
  },
  connectButton: {
    color: theme.altText,
    background: theme.bright,
    marginLeft: 7,
    '&:hover': {
      background: theme.brightHover,
    },
  },
  fadeOut: {
    opacity: 0,
    transition: 'opacity 0.5s',
  },
  joinedText: {
    marginTop: 10,
  },
  communityLink: {
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
      color: theme.primaryText,
    },
  },
  noUnderline: {
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
      color: theme.dark,
    },
  },
}));

type Props = {
  communityID: string;
  private: boolean;
  name: string;
  type: CommunityType;
  profilePicture?: string;
  memberCount: number;
  mutualMemberCount: number;
  removeSuggestion: (communityID: string) => void;
  setNotification: (
    successMode: 'success' | 'notify' | 'error',
    message: string
  ) => void;
  isLast?: boolean;

  accessToken: string;
  refreshToken: string;
};

function DiscoveryCommunity(props: Props) {
  const styles = useStyles();

  const [visible, setVisible] = useState(true);

  function removeSuggestion() {
    setVisible(false);
    setTimeout(() => {
      props.removeSuggestion(props.communityID);
    }, 500);
  }

  async function requestJoin() {
    const { data } = await makeRequest(
      'POST',
      `/api/community/${props.communityID}/join`,
      {},
      true,
      props.accessToken,
      props.refreshToken
    );

    if (data['success'] === 1) {
      const message =
        data['content']['newStatus'] === 'PENDING'
          ? `Successfully requested to join ${props.name}`
          : `Successfully joined ${props.name}`;
      props.setNotification('success', message);
      removeSuggestion();
    } else if (data['success'] === 0) {
      props.setNotification('notify', 'User is already a part of community');
      removeSuggestion();
    } else {
      props.setNotification('error', 'There was an error requesting the connection');
      setVisible(true);
    }
  }

  function renderButtons() {
    return (
      <div className={styles.buttonContainer}>
        {props.private && (
          <FaLock
            color={theme.secondaryText}
            size={18}
            className={styles.lockIcon}
          />
        )}
        <Button
          className={styles.removeButton}
          size="small"
          onClick={removeSuggestion}
        >
          Remove
        </Button>
        <Button className={styles.connectButton} size="small" onClick={requestJoin}>
          Join
        </Button>
      </div>
    );
  }

  return (
    <div className={props.isLast ? styles.lastWrapper : styles.wrapper}>
      <div className={visible ? '' : styles.fadeOut}>
        <div className={styles.communityInfo}>
          <a
            href={`/community/${props.communityID}`}
            className={styles.communityLink}
          >
            <ProfilePicture
              editable={false}
              type={'profile'}
              height={80}
              width={80}
              borderRadius={50}
              currentPicture={props.profilePicture}
            />
          </a>
          <div className={styles.textContainer}>
            <a
              href={`/community/${props.communityID}`}
              className={styles.noUnderline}
            >
              <RSText type="body" bold size={13} color={theme.primaryText}>
                {props.name || ''}
              </RSText>
            </a>

            <RSText type="body" italic={true} size={11} color={theme.secondaryText}>
              {props.type || ''}
            </RSText>
            <RSText type="body" size={11} color={theme.secondaryText}>
              {props.memberCount || 0} Members
            </RSText>
            <RSText type="body" size={11} color={theme.secondaryText}>
              {props.mutualMemberCount || 0} Mutual
            </RSText>
          </div>
        </div>
        {renderButtons()}
      </div>
    </div>
  );
}

export default DiscoveryCommunity;
