import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';

import { Slide } from '@material-ui/core';
import { TransitionProps } from '@material-ui/core/transitions';

import RSText from '../../../base-components/RSText';
import { colors } from '../../../theme/Colors';
import theme from '../../../theme/Theme';
import DiscoverySinglePerson from './DiscoverySinglePerson';
import DiscoveryCommunity from './DiscoveryCommunity';
import ManageSpeakersSnackbar from '../../../event-client/event-video/event-host/ManageSpeakersSnackbar';

import { DiscoverCommunity, DiscoverUser } from '../../../helpers/types';
import { makeRequest } from '../../../helpers/functions';
import { HEADER_HEIGHT } from '../../../helpers/constants';

const VERTICAL_PADDING_TOTAL = 40;

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    width: 270,
    background: theme.background,
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

function DiscoverySidebar(props: Props) {
  const styles = useStyles();

  const [height, setHeight] = useState(
    window.innerHeight - HEADER_HEIGHT - VERTICAL_PADDING_TOTAL
  );
  const [recommendedPeople, setRecommendedPeople] = useState<DiscoverUser[]>([]);
  const [recommendedCommunities, setRecommendedCommunities] = useState<
    DiscoverCommunity[]
  >([]);

  const [transition, setTransition] = useState<any>();
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarMode, setSnackbarMode] = useState<
    'success' | 'error' | 'notify' | null
  >(null);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    getRecommendations();
  }, []);

  function handleResize() {
    setHeight(window.innerHeight - HEADER_HEIGHT - VERTICAL_PADDING_TOTAL);
  }

  async function getRecommendations() {
    const { data } = await makeRequest('GET', '/api/discover/populate');

    if (data['success'] === 1) {
      const { users, communities } = data.content;
      setRecommendedPeople(users);
      setRecommendedCommunities(communities);
    }
  }

  function removeCommunitySuggestion(communityID: string) {
    let newSuggestions = recommendedCommunities.slice();
    for (let i = 0; i < recommendedCommunities.length; i++) {
      const currCommunity = recommendedCommunities[i];
      if (currCommunity._id === communityID) {
        newSuggestions.splice(i, 1);
        setRecommendedCommunities(newSuggestions);
        return;
      }
    }
  }

  function renderCommunities() {
    const communities: any = [];
    if (recommendedCommunities.length === 0) return;

    const numSuggestionsDisplayed =
      recommendedCommunities.length > 6 ? 6 : recommendedCommunities.length;
    for (let i = 0; i < numSuggestionsDisplayed; i++) {
      const currSuggestion = recommendedCommunities[i];
      communities.push(
        <DiscoveryCommunity
          key={currSuggestion._id}
          communityID={currSuggestion._id}
          private={currSuggestion.private}
          name={currSuggestion.name}
          type={currSuggestion.type}
          profilePicture={currSuggestion.profilePicture}
          memberCount={currSuggestion.numMembers}
          mutualMemberCount={currSuggestion.numMutual}
          isLast={i === numSuggestionsDisplayed - 1}
          removeSuggestion={removeCommunitySuggestion}
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
          color={theme.primaryText}
          className={styles.communityText}
        >
          Communities for you
        </RSText>
        {communities}
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

  function removePersonSuggestion(userID: string) {
    let newSuggestions = recommendedPeople.slice();
    for (let i = 0; i < recommendedPeople.length; i++) {
      const currUser = recommendedPeople[i];
      if (currUser._id === userID) {
        newSuggestions.splice(i, 1);
        setRecommendedPeople(newSuggestions);
        return;
      }
    }
  }

  function renderPeople() {
    const people: any = [];
    if (recommendedPeople.length === 0) return;

    const numSuggestionsDisplayed =
      recommendedPeople.length > 6 ? 6 : recommendedPeople.length;
    for (let i = 0; i < numSuggestionsDisplayed; i++) {
      const currSuggestion = recommendedPeople[i];
      people.push(
        <DiscoverySinglePerson
          key={currSuggestion._id}
          userID={currSuggestion._id}
          name={`${currSuggestion.firstName} ${currSuggestion.lastName}`}
          profilePicture={currSuggestion.profilePicture}
          position={currSuggestion.position}
          company={currSuggestion.work}
          numMutualConnections={currSuggestion.numMutualConnections}
          isLast={i === numSuggestionsDisplayed - 1}
          removeSuggestion={removePersonSuggestion}
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
          color={theme.primaryText}
          className={styles.peopleText}
        >
          People for you
        </RSText>
        {people}
      </div>
    );
  }

  return (
    <div className={styles.wrapper} style={{ height: height }}>
      <ManageSpeakersSnackbar
        message={snackbarMessage}
        transition={transition}
        mode={snackbarMode}
        handleClose={() => setSnackbarMode(null)}
      />
      {renderPeople()}
      {renderCommunities()}
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

export default connect(mapStateToProps, mapDispatchToProps)(DiscoverySidebar);
