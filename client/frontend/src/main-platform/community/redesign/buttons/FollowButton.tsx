import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { useSelector } from 'react-redux';
import { RootshareReduxState } from '../../../../redux/store/stateManagement';

import { Slide, Theme as ThemeType } from '@material-ui/core';
import { TransitionProps } from '@material-ui/core/transitions';

import RSText from '../../../../base-components/RSText';
import ManageSpeakersSnackbar from '../../../../event-client/event-video/event-host/ManageSpeakersSnackbar';
import { RSMenu, RSButtonV2, RSButtonVariants } from '../../../reusable-components';

import { makeRequest } from '../../../../helpers/functions';
import { AdminCommunityServiceResponse } from '../../../../helpers/types/communityTypes';
import Theme from '../../../../theme/Theme';

interface StyleProps {
  university: string;
}

const useStyles = makeStyles<ThemeType, StyleProps>((_: any) => ({
  button: {
    height: 28,
    marginTop: 5,
    width: 150,
  },
  menuItemWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
    paddingLeft: 12,
    paddingRight: 12,
    outline: 'none',
  },
  menuItem: {
    '&:hover': {
      cursor: 'pointer',
      color: ({ university }) => Theme.universityAccent[university],
    },
  },
}));

type Props = {
  communityID: string;
  name: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'university' | 'universitySecondary';
  fontSize: number;
  borderRadius?: number;
  style?: React.CSSProperties;
};

function FollowButton(props: Props) {
  const { _id, university } = useSelector(
    (state: RootshareReduxState) => state.user
  );

  const styles = useStyles({ university });

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
    fontSize,
    borderRadius,
    style,
  } = props;

  useEffect(() => {
    if (communityID) getAdminCommunities();
  }, [communityID]);

  async function getAdminCommunities() {
    const { data } = await makeRequest('GET', `/api/user/${_id}/communities/admin`);

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
        className={styles.button}
        fontSize={fontSize}
        borderRadius={borderRadius}
        caps="none"
        disabled={disabled}
        variant={variant}
        style={style}
        onClick={(event: any) => {
          setFollowMenuAnchorEl(event.currentTarget);
        }}
      >
        <RSText size={fontSize}>Follow{Boolean(followMenuAnchorEl) && ' as'}</RSText>
      </RSButtonV2>
      <RSMenu
        open={Boolean(followMenuAnchorEl)}
        anchorEl={followMenuAnchorEl}
        onClose={() => setFollowMenuAnchorEl(null)}
        variant="rounded"
      >
        {adminCommunities.map((community) => {
          const relationship = community.currentCommunityRelationship!;
          return (
            <div className={styles.menuItemWrapper}>
              <RSText
                size={11}
                className={styles.menuItem}
                onClick={getFollowButtonAction(community._id, relationship)}
              >
                {community.name}
              </RSText>

              {relationship !== 'open' && (
                <RSText size={10} color={Theme.secondaryText} italic>
                  &nbsp;
                  {relationship.charAt(0).toUpperCase() + relationship.slice(1)}
                </RSText>
              )}
            </div>
          );
        })}
      </RSMenu>
    </>
  ) : (
    <></>
  );
}

FollowButton.defaultProps = {
  fontSize: 11,
};

export default FollowButton;
