import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { Slide } from '@material-ui/core';
import { TransitionProps } from '@material-ui/core/transitions';
import RSText from '../../../../base-components/RSText';
import { colors } from '../../../../theme/Colors';
import ManageSpeakersSnackbar from '../../../../event-client/event-video/event-host/ManageSpeakersSnackbar';
import SingleFollowCommunity from './SingleFollowCommunity';
import { makeRequest } from '../../../../helpers/functions';
import { HEADER_HEIGHT } from '../../../../helpers/constants';

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
  communityID: string;
};

type FollowCommunity = {
  description: string;
  name: string;
  profilePicture: string;
  type: string;
  _id: string;
};

function FollowedByCommunities(props: Props) {
  const styles = useStyles();

  const [height, setHeight] = useState(
    window.innerHeight - HEADER_HEIGHT - VERTICAL_PADDING_TOTAL
  );

  const [followingCommunities, setFollowingCommunities] = useState<
    FollowCommunity[]
  >([]);
  const [followedByCommunities, setFollowedByCommunities] = useState<
    FollowCommunity[]
  >([]);

  const [transition, setTransition] = useState<any>();
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarMode, setSnackbarMode] = useState<
    'success' | 'error' | 'notify' | null
  >(null);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    fetchData();
  }, []);

  function handleResize() {
    setHeight(window.innerHeight - HEADER_HEIGHT - VERTICAL_PADDING_TOTAL);
  }

  function fetchData() {
    //Retrieve following communities
    makeRequest(
      'GET',
      `/api/community/${props.communityID}/following`,
      {},
      true,
      props.accessToken,
      props.refreshToken
    ).then(({ data }) => {
      if (data['success'] === 1) {
        const { communities: communitiesFollowing } = data.content;
        setFollowingCommunities(communitiesFollowing);
      }
    });
    //Retrieve followed by communities
    makeRequest(
      'GET',
      `/api/community/${props.communityID}/followedBy`,
      {},
      true,
      props.accessToken,
      props.refreshToken
    ).then(({ data }) => {
      if (data['success'] === 1) {
        const { communities: communitiesFollowedBy } = data.content;
        setFollowedByCommunities(communitiesFollowedBy);
      }
    });
  }

  function renderFollowingCommunities() {
    const communitiesFollowing: any = [];
    if (followingCommunities.length === 0) return;

    const numSuggestionsDisplayed =
      followingCommunities.length > 6 ? 6 : followingCommunities.length;
    for (let i = 0; i < numSuggestionsDisplayed; i++) {
      const currSuggestion = followingCommunities[i];
      communitiesFollowing.push(
        <SingleFollowCommunity
          key={currSuggestion._id}
          _id={currSuggestion._id}
          name={currSuggestion.name}
          type={currSuggestion.type}
          description={currSuggestion.description}
          profilePicture={currSuggestion.profilePicture}
          isLast={i === numSuggestionsDisplayed - 1}
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
            Following
          </RSText>
          {communitiesFollowing}
        </div>
      );
    }
  }

  function renderFollowedByCommunities() {
    const communitiesFollowedBy: any = [];
    if (followedByCommunities.length === 0) return;

    const numSuggestionsDisplayed =
      followedByCommunities.length > 6 ? 6 : followedByCommunities.length;
    for (let i = 0; i < numSuggestionsDisplayed; i++) {
      const currSuggestion = followedByCommunities[i];
      communitiesFollowedBy.push(
        <SingleFollowCommunity
          key={currSuggestion._id}
          _id={currSuggestion._id}
          name={currSuggestion.name}
          type={currSuggestion.type}
          description={currSuggestion.description}
          profilePicture={currSuggestion.profilePicture}
          isLast={i === numSuggestionsDisplayed - 1}
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
          Followed By
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
