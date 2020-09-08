import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { Button } from '@material-ui/core';

import { colors } from '../../../theme/Colors';
import RSText from '../../../base-components/RSText';
import ProfilePicture from '../../../base-components/ProfilePicture';

import { makeRequest } from '../../../helpers/functions';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    marginTop: 15,
    borderBottom: `1px solid ${colors.secondaryText}`,
    paddingBottom: 15,
  },
  singlePersonWrapper: {
    display: 'flex',
    justifyContent: 'flex-start',
  },
  textContainer: {
    marginLeft: 10,
  },
  personLink: {
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
      color: colors.primaryText,
    },
  },
  removeButton: {
    color: colors.primaryText,
    background: colors.secondary,
    marginRight: 7,
  },
  connectButton: {
    color: colors.primaryText,
    background: colors.bright,
    marginLeft: 7,
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: 7,
  },
  fadeOut: {
    opacity: 0,
    transition: 'opacity 0.5s',
  },
}));

type Props = {
  userID: string;
  name: string;
  position: string;
  company: string;
  numMutualConnections: number;
  removeSuggestion: (userID: string) => void;
  setNotification: (
    successMode: 'success' | 'notify' | 'error',
    message: string
  ) => void;

  accessToken: string;
  refreshToken: string;
};

function DiscoverySinglePerson(props: Props) {
  const styles = useStyles();

  const [profilePic, setProfilePic] = useState();
  const [visible, setVisible] = useState(true);

  const numMutualConnections = props.numMutualConnections || 0;

  useEffect(() => {
    fetchProfilePic();
  }, [props.userID]);

  async function fetchProfilePic() {
    const { data } = await makeRequest(
      'GET',
      `/api/getProfilePicture/${props.userID}`,
      {},
      true,
      props.accessToken,
      props.refreshToken
    );

    if (data['success'] === 1) setProfilePic(data['content']['imageURL']);
  }

  function removeSuggestion() {
    setVisible(false);
    setTimeout(() => {
      props.removeSuggestion(props.userID);
    }, 500);
  }

  async function requestConnection() {
    const { data } = await makeRequest(
      'POST',
      '/user/requestConnection',
      {
        requestID: props.userID,
      },
      true,
      props.accessToken,
      props.refreshToken
    );

    if (data['success'] === 1) {
      props.setNotification('success', data['message']);
      removeSuggestion();
    } else if (data['success'] === 0) {
      props.setNotification('notify', data['message']);
      removeSuggestion();
    } else {
      props.setNotification('error', 'There was an error requesting the connection');
      setVisible(true);
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={visible ? '' : styles.fadeOut}>
        <div className={styles.singlePersonWrapper}>
          <a href={`/profile/${props.userID}`} className={styles.personLink}>
            <ProfilePicture
              editable={false}
              type={'profile'}
              height={80}
              width={80}
              borderRadius={50}
              currentPicture={profilePic}
            />
          </a>
          <div className={styles.textContainer}>
            <a href={`/profile/${props.userID}`} className={styles.personLink}>
              <RSText type="body" color={colors.primaryText} size={13} bold>
                {props.name}
              </RSText>
            </a>
            <RSText type="body" color={colors.secondaryText} italic size={11}>
              {props.position}
            </RSText>
            <RSText type="body" color={colors.secondaryText} italic size={11}>
              {props.company}
            </RSText>
            <RSText type="body" color={colors.secondaryText} size={10}>
              {numMutualConnections} Mutual Connections
            </RSText>
          </div>
        </div>
        <div className={styles.buttonContainer}>
          <Button
            className={styles.removeButton}
            size="small"
            onClick={removeSuggestion}
          >
            Remove
          </Button>
          <Button
            className={styles.connectButton}
            size="small"
            onClick={requestConnection}
          >
            Connect
          </Button>
        </div>
      </div>
    </div>
  );
}

export default DiscoverySinglePerson;
