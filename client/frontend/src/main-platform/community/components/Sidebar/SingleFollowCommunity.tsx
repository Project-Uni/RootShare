import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Button } from '@material-ui/core';
import { colors } from '../../../../theme/Colors';
import RSText from '../../../../base-components/RSText';
import ProfilePicture from '../../../../base-components/ProfilePicture';
import { makeRequest } from '../../../../helpers/functions';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    marginTop: 15,
    borderBottom: `1px solid ${colors.fourth}`,
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
    height: 50,
    width: 50,
    borderRadius: 50,
    marginRight: 10,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    marginLeft: 10,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButton: {
    color: colors.primaryText,
    background: colors.fourth,
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
  description: string;
  name: string;
  profilePicture: string;
  type: string;
  _id: string;

  setNotification: (
    successMode: 'success' | 'notify' | 'error',
    message: string
  ) => void;

  isLast?: boolean;
  accessToken: string;
  refreshToken: string;
};

function SingleFollowCommunity(props: Props) {
  const styles = useStyles();

  const [visible, setVisible] = useState(true);
  const [association, setAssociation] = useState('NOT A MEMBER');

  useEffect(() => {
    updateAssociation();
  });

  function updateAssociation() {
    setAssociation('MEMBER');
  }

  async function requestJoin() {
    const { data } = await makeRequest(
      'POST',
      `/api/community/${props._id}/join`,
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
    } else if (data['success'] === 0) {
      props.setNotification('notify', 'User is already a part of community');
    } else {
      props.setNotification('error', 'There was an error requesting the connection');
      setVisible(true);
    }
  }

  function renderButtons() {
    return (
      <div className={styles.buttonContainer}>
        <Button className={styles.removeButton} size="small" onClick={requestJoin}>
          {association}
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
          <a href={`/community/${props._id}`} className={styles.communityLink}>
            <ProfilePicture
              editable={false}
              type={'profile'}
              height={60}
              width={60}
              borderRadius={60}
              currentPicture={props.profilePicture}
            />
          </a>
          <div className={styles.textContainer}>
            <a href={`/community/${props._id}`} className={styles.noUnderline}>
              <RSText type="body" bold size={13} color={colors.primaryText}>
                {props.name || ''}
              </RSText>
            </a>

            <RSText type="body" italic={true} size={11} color={colors.primaryText}>
              {props.type || ''}
            </RSText>

            <RSText type="body" italic={false} size={11} color={colors.primaryText}>
              XX Members
            </RSText>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SingleFollowCommunity;
