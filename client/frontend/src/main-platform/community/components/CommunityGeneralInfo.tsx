import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Button, Menu, MenuItem } from '@material-ui/core';

import { FaLock } from 'react-icons/fa';

import { makeRequest } from '../../../helpers/functions';

import PendingMembersModal from './PendingMembersModal';
import PendingFollowRequestsModal from './PendingFollowRequestsModal';
import FollowButton from './FollowButton';

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
    marginTop: -80,
    display: 'flex',
    flexDirection: 'column',
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
  description: {},
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
  buttonContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
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
  numFollowRequests: number;
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
  const [
    showPendingFollowRequestsModal,
    setShowPendingFollowRequestsModal,
  ] = useState(false);
  const [numPending, setNumPending] = useState(props.numPending);
  const [numFollowRequests, setNumFollowRequests] = useState(
    props.numFollowRequests
  );
  const [numMembers, setNumMembers] = useState(props.numMembers);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);

  const descSubstr = props.description.substr(0, MAX_DESC_LEN);

  async function handleJoinClick() {
    setMenuAnchorEl(null);
    const { data } = await makeRequest(
      'POST',
      `/api/community/${props.communityID}/join`
    );
    if (data.success === -1) {
      return alert(
        'There was an error while trying to join this community. Please try again later.'
      );
    }
    if (data.success === 1) {
      props.updateCommunityStatus(data.content['newStatus']);
      if (data.content['newStatus'] === 'JOINED') {
        updateMemberCount(1);
      }
    }
  }

  function handleMemberClick(event: any) {
    setMenuAnchorEl(event.currentTarget);
  }

  async function handleLeaveClick() {
    const { data } = await makeRequest(
      'POST',
      `/api/community/${props.communityID}/leave`
    );
    if (data.success === 1) {
      props.updateCommunityStatus(data.content['newStatus']);
      updateMemberCount(-1);
    } else {
      alert('There was an error trying to leave the community');
    }
  }

  async function handlePendingButtonClick(event: any) {
    setMenuAnchorEl(event.currentTarget);
  }

  async function handleCancelPendingRequest() {
    const { data } = await makeRequest(
      'POST',
      `/api/community/${props.communityID}/cancelPending`
    );
    if (data.success === 1) {
      props.updateCommunityStatus(data.content['newStatus']);
    } else {
      alert(
        'There was an error trying to cancel the pending request. Please try again later'
      );
    }
  }

  function handlePendingClicked() {
    setShowPendingModal(true);
  }

  function handlePendingModalClose() {
    setShowPendingModal(false);
  }

  function updatePendingCount(newNumPending: number) {
    setNumPending(newNumPending);
  }

  function updateFollowRequestCount(newNumRequests: number) {
    setNumFollowRequests(newNumRequests);
  }

  function updateMemberCount(value: 1 | -1) {
    setNumMembers(numMembers + value);
  }

  function handleSeeClicked() {
    setShowFullDesc(!showFullDesc);
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
        <>
          <Button
            className={[styles.button, styles.pendingButton].join(' ')}
            size="large"
            onClick={handlePendingButtonClick}
          >
            Pending
          </Button>
          <Menu
            open={Boolean(menuAnchorEl)}
            anchorEl={menuAnchorEl}
            onClose={() => setMenuAnchorEl(null)}
          >
            <MenuItem onClick={handleCancelPendingRequest}>Cancel Request</MenuItem>
          </Menu>
        </>
      );
    else
      return (
        <>
          <Button
            size="large"
            className={[styles.button, styles.joinedButton].join(' ')}
            onClick={!props.isAdmin ? handleMemberClick : undefined}
          >
            {props.isAdmin ? 'Admin' : 'Member'}
          </Button>
          {!props.isAdmin && (
            <Menu
              open={Boolean(menuAnchorEl)}
              anchorEl={menuAnchorEl}
              onClose={() => setMenuAnchorEl(null)}
            >
              <MenuItem onClick={handleLeaveClick}>Leave Community</MenuItem>
            </Menu>
          )}
        </>
      );
  }

  return (
    <div className={styles.wrapper}>
      <PendingMembersModal
        open={showPendingModal}
        communityID={props.communityID}
        handleClose={handlePendingModalClose}
        updatePendingCount={updatePendingCount}
        updateMemberCount={updateMemberCount}
      />
      <PendingFollowRequestsModal
        open={showPendingFollowRequestsModal}
        communityID={props.communityID}
        handleClose={() => {
          setShowPendingFollowRequestsModal(false);
        }}
        updatePendingCount={updateFollowRequestCount}
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
          <div className={styles.buttonContainer}>
            {renderButton()}
            <FollowButton communityID={props.communityID} name={props.name} />
          </div>
          <div style={{ marginTop: 15 }}>
            <RSText type="body" size={12} color={colors.second}>
              {numMembers} Members
            </RSText>
            <RSText type="body" size={12} color={colors.second}>
              {props.numMutual} Connections
            </RSText>
            {props.isAdmin && (
              <a
                href={undefined}
                onClick={handlePendingClicked}
                className={styles.memberCountLink}
              >
                <RSText type="body" size={12} color={colors.second}>
                  {numPending} Pending Members
                </RSText>
              </a>
            )}
            {props.isAdmin && (
              <a
                href={undefined}
                onClick={() => setShowPendingFollowRequestsModal(true)}
                className={styles.memberCountLink}
              >
                <RSText type="body" size={12} color={colors.second}>
                  {numFollowRequests} Pending Followers
                </RSText>
              </a>
            )}
          </div>
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
