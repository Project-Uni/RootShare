import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';

import { Slide } from '@material-ui/core';
import { TransitionProps } from '@material-ui/core/transitions';

import RSText from '../../../base-components/RSText';
import { colors } from '../../../theme/Colors';
import ManageSpeakersSnackbar from '../../../event-client/event-video/event-host/ManageSpeakersSnackbar';

import FollowingCommunity from './FollowingCommunity';
import FollowedByCommunity from './FollowedByCommunity';

import { DiscoverCommunity } from '../../../helpers/types';
import { makeRequest } from '../../../helpers/functions';
import { HEADER_HEIGHT } from '../../../helpers/constants';

const VERTICAL_PADDING_TOTAL = 40;

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    width: 270,
    background: colors.second,
    textAlign: 'left',
    padding: 20,
    overflow: 'scroll',
  },
  peopleText: {
    textAlign: 'center',
  },
  communityText: {
    textAlign: 'center',
    paddingTop: 10,
  },
}));

type Props = {
  accessToken: string;
  refreshToken: string;
};

function FollowedByCommunities(props: Props) {
  const styles = useStyles();

  const [height, setHeight] = useState(
    window.innerHeight - HEADER_HEIGHT - VERTICAL_PADDING_TOTAL
  );

  const [followingCommunities, setFollowingCommunities] = useState<
    DiscoverCommunity[]
  >([]);
  const [followedByCommunities, setFollowedByCommunities] = useState<
    DiscoverCommunity[]
  >([]);

  const [transition, setTransition] = useState<any>();
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarMode, setSnackbarMode] = useState<
    'success' | 'error' | 'notify' | null
  >(null);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    getFollowing();
  }, []);

  function handleResize() {
    setHeight(window.innerHeight - HEADER_HEIGHT - VERTICAL_PADDING_TOTAL);
  }

  async function getFollowing() {
    const { data } = await makeRequest(
      'GET',
      '/api/community',
      {},
      true,
      props.accessToken,
      props.refreshToken
    );

    if (data['success'] === 1) {
      const { users, communitiesFollowing } = data.content;
      setFollowingCommunities(communitiesFollowing);
    }
  }

  function removeFollowingCommunity(communityID: string) {
    let newSuggestions = followingCommunities.slice();
    for (let i = 0; i < followingCommunities.length; i++) {
      const currCommunity = followingCommunities[i];
      if (currCommunity._id === communityID) {
        newSuggestions.splice(i, 1);
        setFollowingCommunities(newSuggestions);
        return;
      }
    }
  }

  function renderFollowingCommunities() {
    const communitiesFollowing: any = [];
    if (followingCommunities.length === 0) return;

    const numSuggestionsDisplayed =
      followingCommunities.length > 6 ? 6 : followingCommunities.length;
    for (let i = 0; i < numSuggestionsDisplayed; i++) {
      const currSuggestion = followingCommunities[i];
      communitiesFollowing.push(
        <FollowingCommunity
          key={currSuggestion._id}
          communityID={currSuggestion._id}
          private={currSuggestion.private}
          name={currSuggestion.name}
          type={currSuggestion.type}
          profilePicture={currSuggestion.profilePicture}
          memberCount={currSuggestion.numMembers}
          mutualMemberCount={currSuggestion.numMutual}
          isLast={i === numSuggestionsDisplayed - 1}
          removeSuggestion={removeFollowingCommunity}
          setNotification={setNotification}
          accessToken={props.accessToken}
          refreshToken={props.refreshToken}
        />
      );
      return (
        <div>
          <RSText
            size={18}
            type="head"
            bold
            color={colors.primaryText}
            className={styles.communityText}
          >
            Following Communities
          </RSText>
          {communitiesFollowing}
        </div>
      );
    }
  }

  async function getFollowedBy() {
    const { data } = await makeRequest(
      'GET',
      '/api/community',
      {},
      true,
      props.accessToken,
      props.refreshToken
    );

    if (data['success'] === 1) {
      const { users, communitiesFollowedBy } = data.content;
      setFollowingCommunities(communitiesFollowedBy);
    }
  }

  function removeFollowedByCommunity(communityID: string) {
    let newSuggestions = followedByCommunities.slice();
    for (let i = 0; i < followedByCommunities.length; i++) {
      const currCommunity = followedByCommunities[i];
      if (currCommunity._id === communityID) {
        newSuggestions.splice(i, 1);
        setFollowedByCommunities(newSuggestions);
        return;
      }
    }
  }

  function renderFollowedByCommunities() {
    const communitiesFollowedBy: any = [];
    if (followingCommunities.length === 0) return;

    const numSuggestionsDisplayed =
      followedByCommunities.length > 6 ? 6 : followedByCommunities.length;
    for (let i = 0; i < numSuggestionsDisplayed; i++) {
      const currSuggestion = followedByCommunities[i];
      communitiesFollowedBy.push(
        <FollowedByCommunity
          key={currSuggestion._id}
          communityID={currSuggestion._id}
          private={currSuggestion.private}
          name={currSuggestion.name}
          type={currSuggestion.type}
          profilePicture={currSuggestion.profilePicture}
          memberCount={currSuggestion.numMembers}
          mutualMemberCount={currSuggestion.numMutual}
          isLast={i === numSuggestionsDisplayed - 1}
          removeSuggestion={removeFollowedByCommunity}
          setNotification={setNotification}
          accessToken={props.accessToken}
          refreshToken={props.refreshToken}
        />
      );
    }
    return (
      <div>
        <RSText
          size={18}
          type="head"
          bold
          color={colors.primaryText}
          className={styles.communityText}
        >
          Followed By Communities
        </RSText>
        {communitiesFollowedBy}
      </div>
    );
  }

  function setNotification(
    successMode: 'success' | 'notify' | 'error',
    message: string
  ) {
    function slideLeft(props: TransitionProps) {
      return <Slide {...props} direction="left" />;
    }

    setSnackbarMode(successMode);
    setSnackbarMessage(message);
    setTransition(() => slideLeft);
  }

  return (
    <div className={styles.wrapper} style={{ height: height }}>
      <ManageSpeakersSnackbar
        message={snackbarMessage}
        transition={transition}
        mode={snackbarMode}
        handleClose={() => setSnackbarMode(null)}
      />
      {renderFollowingCommunities()}
      {renderFollowedByCommunities()}
    </div>
  );
}

const mapStateToProps = (state: { [key: string]: any }) => {
  return {
    accessToken: state.accessToken,
    refreshToken: state.refreshToken,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(FollowedByCommunities);
