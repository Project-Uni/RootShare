import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { Button, Box } from '@material-ui/core';

import { FaLock } from 'react-icons/fa';

import { colors } from '../../../theme/Colors';
import RSText from '../../../base-components/RSText';
import ProfilePicture from '../../../base-components/ProfilePicture';

import { cropText, makeRequest } from '../../../helpers/functions';
import { CommunityStatus, CommunityType } from '../../../helpers/types';
import Theme from '../../../theme/Theme';

const MAX_DESC_LEN = 200;

const useStyles = makeStyles((_: any) => ({
  box: {
    background: Theme.white,
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
    border: `1px solid ${Theme.bright}`,
  },
  connectButton: {
    background: Theme.bright,
    color: Theme.altText,
    '&:hover': {
      background: Theme.brightHover,
    },
  },
  pendingText: {
    background: Theme.secondaryText,
    padding: 3,
    paddingLeft: 5,
    paddingRight: 5,
    borderRadius: 3,
  },
  textContainer: {
    marginLeft: 20,
    marginRight: 20,
  },
  type: {
    marginBottom: 6,
  },
  noUnderline: {
    width: 'max-content',
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'none',
    },
  },
  lock: {
    marginLeft: 10,
  },
  name: {
    width: 'max-content',
    '&:hover': { textDecoration: 'underline' },
  },
}));

type Props = {
  style?: any;
  userID: string;
  communityID: string;
  private?: boolean;
  name: string;
  type: CommunityType;
  description: string;
  memberCount: number;
  mutualMemberCount: number;
  status: CommunityStatus;
  profilePicture: any;
  admin: string;
  setNotification?: (
    successMode: 'success' | 'notify' | 'error',
    message: string
  ) => void;

  accessToken: string;
  refreshToken: string;
};

function CommunityHighlight(props: Props) {
  const styles = useStyles();

  const [communityStatus, setCommunityStatus] = useState<CommunityStatus>(
    props.status
  );
  const [numMembers, setNumMembers] = useState(props.memberCount);

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
      if (props.private) setCommunityStatus('PENDING');
      else {
        setCommunityStatus('JOINED');
        setNumMembers((prevNumMembers) => prevNumMembers + 1);
      }
    } else
      props.setNotification &&
        props.setNotification('error', 'There was an error requesting membership');
  }

  function renderButton() {
    if (communityStatus === 'OPEN')
      return (
        <Button className={styles.connectButton} onClick={requestJoin}>
          Join
        </Button>
      );
    else if (communityStatus === 'PENDING')
      return (
        <RSText color={Theme.altText} size={12} className={styles.pendingText}>
          PENDING
        </RSText>
      );
    else
      return (
        <RSText color={Theme.secondaryText} size={12}>
          {props.userID === props.admin ? 'ADMIN' : 'MEMBER'}
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
            <div style={{ display: 'flex', alignItems: 'center' }}></div>

            <div style={{ display: 'flex', alignItems: 'center' }}>
              <a
                href={`/community/${props.communityID}`}
                className={styles.noUnderline}
              >
                <RSText
                  type="head"
                  size={13}
                  color={Theme.primaryText}
                  className={styles.name}
                >
                  {props.name}
                </RSText>
              </a>
              {props.private && (
                <FaLock
                  color={Theme.secondaryText}
                  size={13}
                  className={styles.lock}
                />
              )}
            </div>

            <RSText
              type="subhead"
              size={12}
              color={Theme.secondaryText}
              className={styles.type}
            >
              {props.type}
            </RSText>
            <RSText
              type="subhead"
              size={12}
              color={Theme.secondaryText}
              className={styles.type}
            >
              {cropText(props.description, MAX_DESC_LEN)}
            </RSText>
            <RSText type="subhead" size={12} color={Theme.secondaryText}>
              {numMembers} Members | {props.mutualMemberCount} Connections
            </RSText>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {renderButton()}
        </div>
      </div>
    </Box>
  );
}

const mapStateToProps = (state: { [key: string]: any }) => {
  return {
    accessToken: state.accessToken,
    refreshToken: state.refreshToken,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(CommunityHighlight);
