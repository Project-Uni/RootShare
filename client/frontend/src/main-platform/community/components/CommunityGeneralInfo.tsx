import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Button, Menu, MenuItem } from '@material-ui/core';

import { FaLock } from 'react-icons/fa';
import { BsFillCaretDownFill } from 'react-icons/bs';

import { makeRequest } from '../../../helpers/functions';

import PendingMembersModal from './PendingMembersModal';
import RSText from '../../../base-components/RSText';
import { colors } from '../../../theme/Colors';

import {
  CommunityStatus,
  AdminCommunityServiceResponse,
} from '../../../helpers/types/communityTypes';

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
  followButton: {
    backgroundColor: colors.primary,
    color: colors.primaryText,
    '&:hover': {
      backgroundColor: colors.fourth,
    },
  },
}));

type Props = {
  communityID: string;
  userID: string;
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
  const [numMembers, setNumMembers] = useState(props.numMembers);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [followMenuAnchorEl, setFollowMenuAnchorEl] = useState(null);
  const [adminCommunities, setAdminCommunities] = useState<
    AdminCommunityServiceResponse[]
  >([]);

  const descSubstr = props.description.substr(0, MAX_DESC_LEN);

  useEffect(() => {
    getAdminCommunities();
  }, []);

  async function getAdminCommunities() {
    const { data } = await makeRequest(
      'GET',
      `/api/user/${props.userID}/communities/admin`,
      {},
      true,
      props.accessToken,
      props.refreshToken
    );

    if (data.success === 1) {
      const communities = data.content.communities.filter(
        (community: AdminCommunityServiceResponse) =>
          community._id !== props.communityID
      );
      setAdminCommunities(communities);
    }
  }

  async function handleJoinClick() {
    setMenuAnchorEl(null);
    const { data } = await makeRequest(
      'POST',
      `/api/community/${props.communityID}/join`,
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
      `/api/community/${props.communityID}/leave`,
      {},
      true,
      props.accessToken,
      props.refreshToken
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

  function handlePendingClicked() {
    setShowPendingModal(true);
  }

  function handlePendingModalClose() {
    setShowPendingModal(false);
  }

  function updatePendingCount(newNumPending: number) {
    setNumPending(newNumPending);
  }

  function updateMemberCount(value: 1 | -1) {
    setNumMembers(numMembers + value);
  }

  function handleSeeClicked() {
    setShowFullDesc(!showFullDesc);
  }

  async function handleRequestToFollow(communityID: string) {
    if (
      window.confirm(`Are you sure you want to request to follow ${props.name}?`)
    ) {
      setFollowMenuAnchorEl(null);
      const { data } = await makeRequest(
        'POST',
        `/api/community/${props.communityID}/follow`,
        { followAsCommunityID: communityID },
        true,
        props.accessToken,
        props.refreshToken
      );
      console.log('Request to Follow: ', data);
    } else setFollowMenuAnchorEl(null);
  }

  async function handleCancelFollowRequest(communityID: string) {
    if (
      window.confirm(
        `Are you sure you want to request to cancel your follow request to ${props.name}?`
      )
    ) {
      setFollowMenuAnchorEl(null);
      const { data } = await makeRequest(
        'POST',
        `/api/community/${props.communityID}/follow/cancel`,
        { fromCommunityID: communityID },
        true,
        props.accessToken,
        props.refreshToken
      );

      console.log('Cancel follow: ', data);
    } else setFollowMenuAnchorEl(null);
  }

  async function handleUnfollow(communityID: string) {
    console.log('Calling unfollow');
    //TODO - Write the backend for this
  }

  function getCommunityRelationship(community: AdminCommunityServiceResponse) {
    for (let i = 0; i < community.followingCommunities.length; i++)
      if (community.followingCommunities[i].to._id === props.communityID)
        return 'Following';

    for (let i = 0; i < community.outgoingPendingCommunityFollowRequests.length; i++)
      if (
        community.outgoingPendingCommunityFollowRequests[i].to._id ===
        props.communityID
      )
        return 'Pending';

    return '';
  }

  function getFollowButtonAction(
    communityID: string,
    relationship: 'Following' | 'Pending' | ''
  ) {
    switch (relationship) {
      case 'Following':
        return () => handleUnfollow(communityID);
      case 'Pending':
        return () => handleCancelFollowRequest(communityID);
      case '':
      default:
        return () => handleRequestToFollow(communityID);
    }
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

  function renderFollowButton() {
    return (
      <>
        <Button
          size="large"
          endIcon={<BsFillCaretDownFill color={colors.primaryText} size={14} />}
          className={styles.followButton}
          onClick={(event: any) => {
            setFollowMenuAnchorEl(event.currentTarget);
          }}
        >
          Follow as
        </Button>
        <Menu
          open={Boolean(followMenuAnchorEl)}
          anchorEl={followMenuAnchorEl}
          onClose={() => setFollowMenuAnchorEl(null)}
        >
          {adminCommunities.map((community) => {
            const relationship = getCommunityRelationship(community);
            return (
              <MenuItem
                onClick={getFollowButtonAction(community._id, relationship)}
                key={community._id}
              >
                <div>
                  <RSText>{community.name}</RSText>
                  <RSText size={11} italic>
                    {relationship}
                  </RSText>
                </div>
              </MenuItem>
            );
          })}
        </Menu>
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
            {adminCommunities.length > 0 && renderFollowButton()}
          </div>
          <div style={{ marginTop: 15 }}>
            <RSText type="body" size={12} color={colors.second}>
              {numMembers} Members
            </RSText>
            {props.isAdmin && (
              <a
                href={undefined}
                onClick={handlePendingClicked}
                className={styles.memberCountLink}
              >
                <RSText type="body" size={12} color={colors.second}>
                  {numPending} Pending
                </RSText>
              </a>
            )}
            <RSText type="body" size={12} color={colors.second}>
              {props.numMutual} Mutual
            </RSText>
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
