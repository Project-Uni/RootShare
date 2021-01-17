import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Button,
  CircularProgress,
  Menu,
  MenuItem,
  TextField,
} from '@material-ui/core';

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
    flex: 1,
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
    background: Theme.bright,
    color: Theme.altText,
    '&:hover': {
      background: Theme.brightHover,
    },
  },
  pendingButton: {
    paddingLeft: 30,
    paddingRight: 30,
    background: Theme.primary,
    color: Theme.altText,
    '&:hover': {
      background: Theme.primaryHover,
    },
  },
  joinedButton: {
    paddingLeft: 30,
    paddingRight: 30,
    background: Theme.primary,
    color: Theme.altText,
    '&:hover': {
      background: Theme.primaryHover,
    },
  },
  description: {
    marginTop: 7,
  },
  seeMore: {
    textDecoration: 'none',
    fontSize: '11pt',
    color: Theme.secondaryText,
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
  loadingIndicator: {
    color: Theme.primary,
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

  const [fullDesc, setFullDesc] = useState(props.description);

  const descSubstr = cropText(fullDesc, MAX_DESC_LEN);

  const [editingDesc, setEditingDesc] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [updateDescText, setUpdateDescText] = useState(props.description);
  const [editDescErr, setEditDescErr] = useState('');

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
    setEditDescErr('');
    const { data } = await makeRequest(
      'PUT',
      `/api/community/${props.communityID}/update?description=${updateDescText}`
    );
    if (data.success === 1) {
      setFullDesc(updateDescText);
      setEditingDesc(false);
    } else {
      setEditDescErr('There was an error updating the description');
    }

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
        <RSText type="head" size={22} color={Theme.primaryText}>
          {props.name}
          {props.private && (
            <FaLock
              color={Theme.primaryHover}
              size={20}
              className={styles.lockIcon}
            />
          )}
        </RSText>

        <RSText size={16} color={Theme.secondaryText} type="body">
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
              variant="outlined"
              fullWidth
              label="New Description"
              value={updateDescText}
              onChange={(e) => setUpdateDescText(e.target.value)}
            />
          ) : (
            <RSText type="body" color={Theme.secondaryText} size={13}>
              {showFullDesc ? fullDesc : descSubstr}
            </RSText>
          )}
          {props.isAdmin && (
            <div>
              {editingDesc ? (
                <>
                  {editLoading ? (
                    <CircularProgress
                      size={20}
                      className={styles.loadingIndicator}
                    />
                  ) : (
                    <>
                      <RSText
                        color={Theme.secondaryText}
                        className={styles.editDescText}
                        onClick={() => {
                          handleUpdateDescription();
                        }}
                      >
                        Save
                      </RSText>
                      <div style={{ marginTop: 10 }} />
                      <RSText
                        color={Theme.secondaryText}
                        className={styles.editDescText}
                        onClick={() => {
                          setEditingDesc(false);
                          setUpdateDescText(fullDesc);
                        }}
                        size={11}
                      >
                        Cancel
                      </RSText>
                    </>
                  )}
                </>
              ) : (
                <RSText
                  color={Theme.secondaryText}
                  className={styles.editDescText}
                  onClick={() => {
                    setEditingDesc(true);
                  }}
                >
                  Edit
                </RSText>
              )}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          {fullDesc !== descSubstr && !editingDesc && (
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
          <RSText type="body" size={12} color={Theme.secondaryText}>
            {numMembers} Members
          </RSText>
          <RSText type="body" size={12} color={Theme.secondaryText}>
            {props.numMutual} Connections
          </RSText>
          {props.isAdmin && (
            <a
              href={undefined}
              onClick={handlePendingClicked}
              className={styles.memberCountLink}
            >
              <RSText type="body" size={12} color={Theme.secondaryText}>
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
              <RSText type="body" size={12} color={Theme.secondaryText}>
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
