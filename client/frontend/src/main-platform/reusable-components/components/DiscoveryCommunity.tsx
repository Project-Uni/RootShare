import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { Button } from '@material-ui/core';
import { FaLock } from 'react-icons/fa';

import { colors } from '../../../theme/Colors';
import RSText from '../../../base-components/RSText';
import ProfilePicture from '../../../base-components/ProfilePicture';

import { makeRequest } from '../../../helpers/functions';
import { CommunityType } from '../../../helpers/types';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    marginTop: 15,
    borderBottom: `1px solid ${colors.fourth}`,
    paddingBottom: 15,
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
    color: colors.primaryText,
    background: colors.secondary,
    marginRight: 7,
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
    color: colors.primaryText,
    background: colors.bright,
    marginLeft: 7,
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
      color: colors.primaryText,
    },
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
            color={colors.secondaryText}
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
    <div className={styles.wrapper}>
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
              <RSText type="body" bold size={13} color={colors.primaryText}>
                {props.name || ''}
              </RSText>
            </a>

            <RSText type="body" italic={true} size={11} color={colors.secondaryText}>
              {props.type || ''}
            </RSText>
            <RSText type="body" size={11} color={colors.secondaryText}>
              {props.memberCount || 0} Members
            </RSText>
            <RSText type="body" size={11} color={colors.secondaryText}>
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
