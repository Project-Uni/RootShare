import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { connect } from 'react-redux';

import { Button, Menu, MenuItem, Slide } from '@material-ui/core';
import { BsFillCaretDownFill } from 'react-icons/bs';
import { TransitionProps } from '@material-ui/core/transitions';

import RSText from '../../../base-components/RSText';
import ManageSpeakersSnackbar from '../../../event-client/event-video/event-host/ManageSpeakersSnackbar';
import { RSButtonV2 } from '../../reusable-components';

import { makeRequest } from '../../../helpers/functions';
import { AdminCommunityServiceResponse } from '../../../helpers/types/communityTypes';
import Theme from '../../../theme/Theme';

const useStyles = makeStyles((_: any) => ({}));

type Props = {
  communityID: string;
  name: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'university' | 'universitySecondary';
  noCaps?: boolean;
  fontSize?: number;
  borderRadius?: number;
  style?: React.CSSProperties;
  className?: string;

  user: { [key: string]: any };
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

  const {
    communityID,
    name,
    disabled,
    variant,
    noCaps,
    fontSize,
    borderRadius,
    style,
    className,
    user,
  } = props;

  useEffect(() => {
    if (communityID) getAdminCommunities();
  }, [communityID]);

  async function getAdminCommunities() {
    const { data } = await makeRequest(
      'GET',
      `/api/user/${user._id}/communities/admin`
    );

    if (data.success === 1) {
      let communities: AdminCommunityServiceResponse[] = data.content.communities.filter(
        (community: AdminCommunityServiceResponse) => community._id !== communityID
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
      if (community.followingCommunities[i].to._id === communityID)
        return 'following';

    for (let i = 0; i < community.outgoingPendingCommunityFollowRequests.length; i++)
      if (community.outgoingPendingCommunityFollowRequests[i].to._id === communityID)
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
    if (window.confirm(`Are you sure you want to request to follow ${name}?`)) {
      setFollowMenuAnchorEl(null);
      const { data } = await makeRequest(
        'POST',
        `/api/community/${communityID}/follow`,
        { followAsCommunityID: communityID }
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
        setSnackbarMessage(`Successfully requested to follow ${name}`);
        setSnackbarMode('notify');
      } else {
        setTransition(() => slideLeft);
        setSnackbarMessage(`There was an error requesting to follow ${name}.`);
        setSnackbarMode('error');
      }
    } else setFollowMenuAnchorEl(null);
  }

  async function handleCancelFollowRequest(communityID: string) {
    if (
      window.confirm(
        `Are you sure you want to cancel your follow request to ${name}?`
      )
    ) {
      setFollowMenuAnchorEl(null);
      const { data } = await makeRequest(
        'POST',
        `/api/community/${communityID}/follow/cancel`,
        { fromCommunityID: communityID }
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
        setSnackbarMessage(`Successfully cancelled follow request to ${name}`);
        setSnackbarMode('notify');
      } else {
        setTransition(() => slideLeft);
        setSnackbarMessage('There was an error cancelling your follow request.');
        setSnackbarMode('error');
      }
    } else setFollowMenuAnchorEl(null);
  }

  async function handleUnfollow(communityID: string) {
    if (window.confirm(`Are you sure you want to unfollow ${name}?`)) {
      setFollowMenuAnchorEl(null);
      const { data } = await makeRequest(
        'POST',
        `/api/community/${communityID}/unfollow`,
        { fromCommunityID: communityID }
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
        setSnackbarMessage(`Successfully unfollowed ${name}`);
        setSnackbarMode('notify');
      } else {
        setTransition(() => slideLeft);
        setSnackbarMessage(`There was an error trying to unfollow ${name}.`);
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
      <RSButtonV2
        className={className}
        fontSize={fontSize}
        borderRadius={borderRadius}
        noCaps={noCaps}
        disabled={disabled}
        variant={variant}
        style={style}
        onClick={(event: any) => {
          setFollowMenuAnchorEl(event.currentTarget);
        }}
      >
        Follow
      </RSButtonV2>
      <Menu
        open={Boolean(followMenuAnchorEl)}
        anchorEl={followMenuAnchorEl}
        onClose={() => setFollowMenuAnchorEl(null)}
      >
        {adminCommunities.map((community) => {
          const relationship = community.currentCommunityRelationship!;
          return (
            <MenuItem
              // onClick={getFollowButtonAction(community._id, relationship)}
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
