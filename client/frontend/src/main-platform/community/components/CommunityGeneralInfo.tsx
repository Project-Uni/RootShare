import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Button, Menu, MenuItem, TextField } from '@material-ui/core';

import { FaLock } from 'react-icons/fa';

import { makeRequest } from '../../../helpers/functions';

import PendingMembersModal from './PendingMembersModal';
import PendingFollowRequestsModal from './PendingFollowRequestsModal';
import {
  MeetTheGreeksModal,
  MTGMessageModal,
  InterestedButton,
  MTGInterestedUsersModal,
} from './MeetTheGreeks';
import FollowButton from './FollowButton';

import RSText from '../../../base-components/RSText';
import { colors } from '../../../theme/Colors';

import { cropText } from '../../../helpers/functions';
import { CommunityStatus, CommunityType } from '../../../helpers/types';
import Theme from '../../../theme/Theme';

const MAX_DESC_LEN = 275;

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    textAlign: 'left',
    marginLeft: 50,
    marginRight: 50,
    display: 'flex',
    justifyContent: 'space-between',
  },
  top: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  left: {
    marginRight: 20,
  },
  right: {
    minWidth: 150,
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
  description: {
    marginTop: 7,
  },
  seeMore: {
    textDecoration: 'none',
    fontSize: '11pt',
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
  editDescText: {
    '&:hover': {
      textDecoration: 'underline',
      cursor: 'pointer',
    },
    marginLeft: 15,
  },
}));

type CommunityFlags = {
  isMTGFlag: boolean;
};

type Props = {
  communityID: string;
  status: CommunityStatus;
  name: string;
  description: string;
  numMembers: number;
  numPending: number;
  numMutual: number;
  numFollowRequests: number;
  type: CommunityType;
  private?: boolean;
  isAdmin?: boolean;
  isMTG?: boolean;

  updateCommunityStatus: (newStatus: CommunityStatus) => any;
  flags: CommunityFlags;
};

function CommunityGeneralInfo(props: Props) {
  const styles = useStyles();
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [
    showPendingFollowRequestsModal,
    setShowPendingFollowRequestsModal,
  ] = useState(false);

  const [showMTGModal, setShowMTGModal] = useState(false);
  const [showMTGMessageModal, setShowMTGMessageModal] = useState(false);
  const [showInterestedUsersModal, setShowInterestedUsersModal] = useState(false);

  const [numPending, setNumPending] = useState(props.numPending);
  const [numFollowRequests, setNumFollowRequests] = useState(
    props.numFollowRequests
  );
  const [numMembers, setNumMembers] = useState(props.numMembers);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);

  const descSubstr = cropText(props.description, MAX_DESC_LEN);

  const [editingDesc, setEditingDesc] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  async function handleJoinClick() {
    setMenuAnchorEl(null);
    const { data } = await makeRequest(
      'POST',
      `/api/community/${props.communityID}/join`
    );
    if (data.success !== 1)
      return alert(
        'There was an error while trying to join this community. Please try again later.'
      );

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

  async function handleUpdateDescription() {
    setEditLoading(true);
    setEditingDesc(false);
    setEditLoading(false);
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

  function renderStatusButton() {
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
            onClick={handleMemberClick}
          >
            {props.isAdmin ? 'Admin' : 'Member'}
          </Button>
          {props.isAdmin ? (
            props.flags.isMTGFlag && (
              <Menu
                open={Boolean(menuAnchorEl)}
                anchorEl={menuAnchorEl}
                onClose={() => setMenuAnchorEl(null)}
              >
                <MenuItem
                  onClick={() => {
                    setShowMTGModal(true);
                    setMenuAnchorEl(null);
                  }}
                >
                  Meet The Greeks
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setShowMTGMessageModal(true);
                    setMenuAnchorEl(null);
                  }}
                >
                  Messaging
                </MenuItem>
                <MenuItem
                  onClick={async () => {
                    setShowInterestedUsersModal(true);
                    setMenuAnchorEl(null);
                  }}
                >
                  Interested Users
                </MenuItem>
              </Menu>
            )
          ) : (
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
      {props.isAdmin && (
        <>
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
          {props.flags.isMTGFlag && (
            <>
              <MeetTheGreeksModal
                open={showMTGModal}
                onClose={() => setShowMTGModal(false)}
                communityName={props.name}
                communityID={props.communityID}
              />
              <MTGMessageModal
                open={showMTGMessageModal}
                communityName={props.name}
                communityID={props.communityID}
                onClose={() => setShowMTGMessageModal(false)}
              />
              <MTGInterestedUsersModal
                open={showInterestedUsersModal}
                onClose={() => setShowInterestedUsersModal(false)}
                communityName={props.name}
                communityID={props.communityID}
              />
            </>
          )}
        </>
      )}

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
        <div
          style={{ display: 'flex', alignItems: 'center' }}
          className={styles.description}
        >
          {editingDesc ? (
            <TextField
              rows={3}
              multiline
              autoFocus
              onBlur={() => {
                if (!editLoading) setEditingDesc(false);
              }}
              variant="outlined"
              fullWidth
              label="New Description"
            />
          ) : (
            <RSText type="body" color={colors.second} size={13}>
              {showFullDesc ? props.description : descSubstr}
            </RSText>
          )}
          {props.isAdmin && (
            <RSText
              color={Theme.secondaryText}
              className={styles.editDescText}
              onClick={() => {
                if (editingDesc && !editLoading) handleUpdateDescription();
                else setEditingDesc(true);
              }}
            >
              {editingDesc ? 'Save' : 'Edit'}
            </RSText>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          {props.description !== descSubstr && (
            <a
              href={undefined}
              className={styles.seeMore}
              onClick={handleSeeClicked}
            >
              SEE {showFullDesc ? 'LESS' : 'MORE'}
            </a>
          )}
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.buttonContainer}>
          {renderStatusButton()}
          <FollowButton communityID={props.communityID} name={props.name} />
          {props.flags.isMTGFlag && !props.isAdmin && (
            <InterestedButton communityID={props.communityID} />
          )}
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
  );
}

export default CommunityGeneralInfo;
