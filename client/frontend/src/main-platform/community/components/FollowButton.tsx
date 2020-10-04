import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { Button, Menu, MenuItem, Slide } from '@material-ui/core';
import { BsFillCaretDownFill } from 'react-icons/bs';
import { TransitionProps } from '@material-ui/core/transitions';

import { connect } from 'react-redux';

import { makeRequest } from '../../../helpers/functions';
import RSText from '../../../base-components/RSText';
import { colors } from '../../../theme/Colors';

import { AdminCommunityServiceResponse } from '../../../helpers/types/communityTypes';
import ManageSpeakersSnackbar from '../../../event-client/event-video/event-host/ManageSpeakersSnackbar';

const useStyles = makeStyles((_: any) => ({
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
  name: string;
  user: { [key: string]: any };
  accessToken: string;
  refreshToken: string;
};

function FollowButton(props: Props) {
  const styles = useStyles();
  const [followMenuAnchorEl, setFollowMenuAnchorEl] = useState(null);
  const [adminCommunities, setAdminCommunities] = useState<
    AdminCommunityServiceResponse[]
  >([]);
  const [transition, setTransition] = useState<any>();
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarMode, setSnackbarMode] = useState<
    'success' | 'error' | 'notify' | null
  >(null);

  useEffect(() => {
    getAdminCommunities();
  }, []);

  async function getAdminCommunities() {
    const { data } = await makeRequest(
      'GET',
      `/api/user/${props.user._id}/communities/admin`,
      {},
      true,
      props.accessToken,
      props.refreshToken
    );

    if (data.success === 1) {
      const communities: AdminCommunityServiceResponse[] = data.content.communities.filter(
        (community: AdminCommunityServiceResponse) =>
          community._id !== props.communityID
      );
      for (let i = 0; i < communities.length; i++) {
        const relationship = getCommunityRelationship(communities[i]);
        communities[i].currentCommunityRelationship = relationship;
      }
      setAdminCommunities(communities);
    }
  }

  function getCommunityRelationship(community: AdminCommunityServiceResponse) {
    for (let i = 0; i < community.followingCommunities.length; i++)
      if (community.followingCommunities[i].to._id === props.communityID)
        return 'following';

    for (let i = 0; i < community.outgoingPendingCommunityFollowRequests.length; i++)
      if (
        community.outgoingPendingCommunityFollowRequests[i].to._id ===
        props.communityID
      )
        return 'pending';

    return 'open';
  }

  function slideLeft(props: TransitionProps) {
    return <Slide {...props} direction="left" />;
  }

  function getFollowButtonAction(
    communityID: string,
    relationship: 'following' | 'pending' | 'open'
  ) {
    switch (relationship) {
      case 'following':
        return () => handleUnfollow(communityID);
      case 'pending':
        return () => handleCancelFollowRequest(communityID);
      case 'open':
      default:
        return () => handleRequestToFollow(communityID);
    }
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
      if (data.success === 1) {
        const communities = adminCommunities;
        for (let i = 0; i < communities.length; i++) {
          if (communities[i]._id === communityID) {
            communities[i].currentCommunityRelationship = 'pending';
            setAdminCommunities(communities);
            break;
          }
        }
        setTransition(() => slideLeft);
        setSnackbarMessage(`Successfully requested to follow ${props.name}`);
        setSnackbarMode('notify');
      } else {
        setTransition(() => slideLeft);
        setSnackbarMessage('There was an error performing this action.');
        setSnackbarMode('error');
      }
    } else setFollowMenuAnchorEl(null);
  }

  async function handleCancelFollowRequest(communityID: string) {
    if (
      window.confirm(
        `Are you sure you want to cancel your follow request to ${props.name}?`
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
      if (data.success === 1) {
        const communities = adminCommunities;
        for (let i = 0; i < communities.length; i++) {
          if (communities[i]._id === communityID) {
            communities[i].currentCommunityRelationship = 'open';
            setAdminCommunities(communities);
            break;
          }
        }
        setTransition(() => slideLeft);
        setSnackbarMessage(`Successfully cancelled follow request to ${props.name}`);
        setSnackbarMode('notify');
      } else {
        setTransition(() => slideLeft);
        setSnackbarMessage('There was an error performing this action.');
        setSnackbarMode('error');
      }
    } else setFollowMenuAnchorEl(null);
  }

  async function handleUnfollow(communityID: string) {
    if (window.confirm(`Are you sure you want to unfollow ${props.name}?`)) {
      setFollowMenuAnchorEl(null);
      const { data } = await makeRequest(
        'POST',
        `/api/community/${props.communityID}/unfollow`,
        { fromCommunityID: communityID },
        true,
        props.accessToken,
        props.refreshToken
      );
      if (data.success === 1) {
        const communities = adminCommunities;
        for (let i = 0; i < communities.length; i++) {
          if (communities[i]._id === communityID) {
            communities[i].currentCommunityRelationship = 'open';
            setAdminCommunities(communities);
            break;
          }
        }
        setTransition(() => slideLeft);
        setSnackbarMessage(`Successfully unfollowed ${props.name}`);
        setSnackbarMode('notify');
      } else {
        setTransition(() => slideLeft);
        setSnackbarMessage('There was an error performing this action.');
        setSnackbarMode('error');
      }
    } else setFollowMenuAnchorEl(null);
  }

  return adminCommunities.length > 0 ? (
    <>
      <ManageSpeakersSnackbar
        message={snackbarMessage}
        transition={transition}
        mode={snackbarMode}
        handleClose={() => setSnackbarMode(null)}
      />
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
          const relationship = community.currentCommunityRelationship!;
          return (
            <MenuItem
              onClick={getFollowButtonAction(community._id, relationship)}
              key={community._id}
            >
              <div>
                <RSText>{community.name}</RSText>
                {relationship !== 'open' && (
                  <RSText size={11} italic>
                    {relationship.charAt(0).toUpperCase() + relationship.slice(1)}
                  </RSText>
                )}
              </div>
            </MenuItem>
          );
        })}
      </Menu>
    </>
  ) : (
    <></>
  );
}

const mapStateToProps = (state: { [key: string]: any }) => {
  return {
    user: state.user,
    accessToken: state.accessToken,
    refreshToken: state.refreshToken,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(FollowButton);
