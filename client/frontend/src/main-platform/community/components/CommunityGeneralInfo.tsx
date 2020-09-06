import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { Button } from '@material-ui/core';
import { FaLock } from 'react-icons/fa';

import { makeRequest } from '../../../helpers/functions';

import PendingMembersModal from './PendingMembersModal';
import RSText from '../../../base-components/RSText';
import { colors } from '../../../theme/Colors';

import { CommunityStatus } from '../../../helpers/types/communityTypes';

const MAX_DESC_LEN = 275;

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    textAlign: 'left',
    marginLeft: 50,
    marginRight: 50,
  },
  top: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  left: {},
  right: {
    marginTop: -50,
  },
  divider: {
    marginLeft: 10,
    marginRight: 10,
  },
  lockIcon: {
    marginLeft: 15,
  },
  button: {
    marginBottom: 15,
  },
  joinButton: {
    paddingLeft: 45,
    paddingRight: 45,
    background: colors.bright,
    color: colors.primaryText,
    '&:hover': {
      background: colors.primary,
    },
  },
  pendingButton: {
    paddingLeft: 30,
    paddingRight: 30,
    background: colors.secondaryText,
    color: colors.primaryText,
    '&:hover': {
      background: colors.primary,
    },
  },
  joinedButton: {
    paddingLeft: 30,
    paddingRight: 30,
    background: colors.primary,
    color: colors.primaryText,
    '&:hover': {
      background: colors.secondaryText,
    },
  },
  description: {
    marginTop: 10,
  },
  seeMore: {
    textDecoration: 'none',
    fontSize: '13pt',
    color: colors.secondaryText,
    '&:hover': {
      textDecoration: 'underline',
      cursor: 'pointer',
    },
  },
  memberCountLink: {
    textDecoration: 'none',
    '&:hover': {
      cursor: 'pointer',
      textDecoration: 'underline',
    },
  },
}));

type Props = {
  communityID: string;
  status: CommunityStatus;
  name: string;
  description: string;
  numMembers: number;
  numPending: number;
  numMutual: number;
  type:
    | 'Social'
    | 'Business'
    | 'Just for Fun'
    | 'Athletics'
    | 'Student Organization'
    | 'Academic';
  private?: boolean;
  isAdmin?: boolean;
  accessToken: string;
  refreshToken: string;
  updateCommunityStatus: (newStatus: CommunityStatus) => any;
};

function CommunityGeneralInfo(props: Props) {
  const styles = useStyles();
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [numPending, setNumPending] = useState(props.numPending);

  const descSubstr = props.description.substr(0, MAX_DESC_LEN);

  function handleSeeClicked() {
    setShowFullDesc(!showFullDesc);
  }

  async function handleJoinClick() {
    const { data } = await makeRequest(
      'GET',
      `/api/community/${props.communityID}/updateStatus/join`,
      {},
      true,
      props.accessToken,
      props.refreshToken
    );
    if (data.success === -1) {
      return alert(
        'There was an error while trying to join this community. Please try again later.'
      );
    }
    if (data.success === 1) props.updateCommunityStatus(data.content['newStatus']);
  }

  async function handleLeaveClick() {
    if (window.confirm('Are you sure you want to leave this community?')) {
      const { data } = await makeRequest(
        'GET',
        `/api/community/${props.communityID}/leave`,
        {},
        true,
        props.accessToken,
        props.refreshToken
      );
      if (data.success === 1) {
        props.updateCommunityStatus(data.content['newStatus']);
      } else {
        alert('There was an error trying to leave the community');
      }
    }
  }

  async function handlePendingButtonClick() {
    if (
      window.confirm(
        'Are you sure you want to cancel your request to join the community?'
      )
    ) {
      const { data } = await makeRequest(
        'GET',
        `/api/community/${props.communityID}/cancelPending`,
        {},
        true,
        props.accessToken,
        props.refreshToken
      );
      if (data.success === 1) {
        props.updateCommunityStatus(data.content['newStatus']);
      } else {
        alert(
          'There was an error trying to cancel the pending request. Please try again later'
        );
      }
    }
  }

  function handlePendingClicked() {
    setShowPendingModal(true);
  }

  function handlePendingModalClose() {
    setShowPendingModal(false);
  }

  function decreasePendingCount() {
    setNumPending(numPending - 1);
  }

  function renderButton() {
    if (props.status === 'OPEN')
      return (
        <Button
          className={[styles.button, styles.joinButton].join(' ')}
          size="large"
          onClick={handleJoinClick}
        >
          Join
        </Button>
      );
    else if (props.status === 'PENDING')
      return (
        <Button
          className={[styles.button, styles.pendingButton].join(' ')}
          size="large"
          onClick={handlePendingButtonClick}
        >
          Pending
        </Button>
      );
    else
      return (
        <Button
          size="large"
          className={[styles.button, styles.joinedButton].join(' ')}
          onClick={!props.isAdmin ? handleLeaveClick : undefined}
        >
          {props.isAdmin ? 'Admin' : 'Member'}
        </Button>
      );
  }

  return (
    <div className={styles.wrapper}>
      <PendingMembersModal
        open={showPendingModal}
        communityID={props.communityID}
        handleClose={handlePendingModalClose}
        decreasePendingCount={decreasePendingCount}
      />
      <div className={styles.top}>
        <div className={styles.left}>
          <RSText type="head" size={22} color={colors.second}>
            {props.name}
            {props.private && (
              <FaLock
                color={colors.secondaryText}
                size={20}
                className={styles.lockIcon}
              />
            )}
          </RSText>
          <RSText size={16} color={colors.secondaryText} type="body">
            {props.type}
          </RSText>
        </div>
        <div className={styles.right}>
          {renderButton()}
          <RSText type="body" size={12} color={colors.second} bold>
            {props.numMembers} Members
          </RSText>
          {props.isAdmin && (
            <a
              href={undefined}
              onClick={handlePendingClicked}
              className={styles.memberCountLink}
            >
              <RSText type="body" size={12} color={colors.second} bold>
                {numPending} Pending
              </RSText>
            </a>
          )}
          <RSText type="body" size={12} color={colors.second} bold>
            {props.numMutual} Mutual
          </RSText>
        </div>
      </div>
      <RSText
        type="body"
        color={colors.second}
        size={13}
        className={styles.description}
      >
        {props.description === descSubstr || showFullDesc
          ? props.description
          : descSubstr + ' ...'}
      </RSText>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        {props.description !== descSubstr && (
          <a href={undefined} className={styles.seeMore} onClick={handleSeeClicked}>
            SEE {showFullDesc ? 'LESS' : 'MORE'}
          </a>
        )}
      </div>
    </div>
  );
}

export default CommunityGeneralInfo;
