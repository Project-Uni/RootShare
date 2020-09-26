import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { Button, Menu, MenuItem } from '@material-ui/core';
import { BsFillCaretDownFill } from 'react-icons/bs';

import { connect } from 'react-redux';

import { makeRequest } from '../../../helpers/functions';
import RSText from '../../../base-components/RSText';
import { colors } from '../../../theme/Colors';

import { AdminCommunityServiceResponse } from '../../../helpers/types/communityTypes';

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
      const communities = data.content.communities.filter(
        (community: AdminCommunityServiceResponse) =>
          community._id !== props.communityID
      );
      setAdminCommunities(communities);
    }
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
      }
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
      if (data.success === 1) {
        console.log('Cancel follow: ', data);
      }
    } else setFollowMenuAnchorEl(null);
  }

  async function handleUnfollow(communityID: string) {
    console.log('Calling unfollow');
    //TODO - Write the backend for this
  }

  return adminCommunities.length > 0 ? (
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
