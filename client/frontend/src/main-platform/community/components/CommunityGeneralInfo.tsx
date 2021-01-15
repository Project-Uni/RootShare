import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { Button, Menu, MenuItem, TextField } from '@material-ui/core';
import CreateIcon from '@material-ui/icons/Create';
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
  adminDescWrapper: {
    display: 'flex',
    marginTop: 7,
    '&:hover': {
      cursor: 'pointer',
    },
  },
  description: {
    marginTop: 7,
  },
  editIcon: {
    marginLeft: 5,
  },
  descEditContainer: {
    display: 'flex',
    alignItems: 'flex-end',
    marginTop: 7,
  },
  cancelButton: {
    marginLeft: 5,
    height: 35,
    color: colors.primaryText,
    background: colors.second,
  },
  saveButton: {
    marginLeft: 5,
    height: 35,
    color: colors.primaryText,
    background: colors.second,
  },
  textField: {
    [`& fieldset`]: {
      borderRadius: 9,
    },
    flex: 1,
    color: colors['shade-one'],
    borderRadius: 9,
    background: '#e9e9e9',
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
  cssLabel: {
    color: colors.secondaryText,
  },
  cssFocused: {
    color: colors.first,
    borderWidth: '1px',
    borderColor: `${colors.first} !important`,
  },
  cssOutlinedInput: {
    '&$cssFocused $notchedOutline': {
      // color: '#f2f2f2 !important',
      // label: '#f2f2f2 !important',
      borderWidth: '2px',
      borderColor: `${colors.second} !important`,
    },
  },
  notchedOutline: {
    borderWidth: '1px',
    label: colors.primaryText,
    borderColor: colors.primaryText,
    color: colors.primaryText,
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

  const [hoverDesc, setHoverDesc] = useState(false);
  const [editDesc, setEditDesc] = useState(false);
  const [originalDesc, setOriginalDesc] = useState(props.description);
  const [updatedDesc, setUpdatedDesc] = useState('');

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

  async function submitEditedDesc() {
    setEditDesc(false);
    const trimmed = updatedDesc.trim();
    setOriginalDesc(trimmed);

    await makeRequest(
      'POST',
      `/api/community/${props.communityID}/updateDescription`,
      {
        newDescription: trimmed,
      }
    );
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

  function handleMouseOver() {
    setHoverDesc(true);
  }

  function handleMouseLeave() {
    setHoverDesc(false);
  }

  function startEditingDesc() {
    setUpdatedDesc(originalDesc);
    setEditDesc(true);
  }

  function cancelEditingDesc() {
    setEditDesc(false);
    setUpdatedDesc(originalDesc);
  }

  function handleDescChange(event: any) {
    setUpdatedDesc(event.target.value);
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

  function renderAdminDesc() {
    const showIcon =
      hoverDesc || !originalDesc || originalDesc.length === 0 ? 'visible' : 'hidden';
    return (
      <div
        className={styles.adminDescWrapper}
        onMouseEnter={handleMouseOver}
        onMouseLeave={handleMouseLeave}
        onClick={startEditingDesc}
      >
        <RSText
          type="subhead" //todo
          size={13}
          color={colors.second}
          className={styles.description}
        >
          {originalDesc}
        </RSText>
        <CreateIcon
          fontSize="small"
          className={styles.editIcon}
          style={{ visibility: showIcon }}
        />
      </div>
    );
  }

  function renderEditDesc() {
    return (
      <div className={styles.descEditContainer}>
        <TextField
          multiline
          type="search"
          label="Description"
          variant="outlined"
          size="small"
          className={styles.textField}
          onChange={handleDescChange}
          value={updatedDesc}
          InputLabelProps={{
            classes: {
              root: styles.cssLabel,
              focused: styles.cssFocused,
            },
          }}
          InputProps={{
            classes: {
              root: styles.cssOutlinedInput,
              focused: styles.cssFocused,
              notchedOutline: styles.notchedOutline,
            },
            inputMode: 'numeric',
          }}
        />
        <div className={styles.buttonContainer}>
          <Button className={styles.cancelButton} onClick={cancelEditingDesc}>
            Cancel
          </Button>
          <Button className={styles.saveButton} onClick={submitEditedDesc}>
            Save
          </Button>
        </div>
      </div>
    );
  }

  function renderOtherDesc() {
    return (
      <>
        <RSText
          type="body"
          color={colors.second}
          size={13}
          className={styles.description}
        >
          {showFullDesc ? props.description : descSubstr}
        </RSText>
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
        {editDesc
          ? renderEditDesc()
          : props.isAdmin
          ? renderAdminDesc()
          : renderOtherDesc()}
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
