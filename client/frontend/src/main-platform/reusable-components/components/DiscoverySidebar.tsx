import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';

import RSText from '../../../base-components/RSText';
import { colors } from '../../../theme/Colors';
import DiscoverySinglePerson from './DiscoverySinglePerson';
import DiscoveryCommunity from './DiscoveryCommunity';

import { UserType } from '../../../helpers/types';
import { makeRequest } from '../../../helpers/functions';

const HEADER_HEIGHT = 60;
const VERTICAL_PADDING_TOTAL = 40;

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    width: 270,
    background: colors.second,
    textAlign: 'left',
    padding: 20,
    overflow: 'scroll',
  },
  pplForYouText: {
    marginTop: 15,
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
  const [recommendedPeople, setRecommendedPeople] = useState<UserType[]>([]);
  const [recommendedCommunities, setRecommendedCommunities] = useState([]);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    getRecommendations();
  }, []);

  function handleResize() {
    setHeight(window.innerHeight - HEADER_HEIGHT - VERTICAL_PADDING_TOTAL);
  }

  async function getRecommendations() {
    const { data } = await makeRequest(
      'GET',
      '/user/getConnectionSuggestions',
      {},
      true,
      props.accessToken,
      props.refreshToken
    );

    if (data['success'] === 1) setRecommendedPeople(data['content']['suggestions']);
  }

  function renderCommunities() {
    //Test code
    const communities = [];
    for (let i = 0; i < 5; i++) {
      let status: 'OPEN' | 'JOINED' | 'PENDING';
      if (i % 3 == 0) status = 'OPEN';
      else if (i % 3 == 2) status = 'PENDING';
      else status = 'JOINED';
      communities.push(
        <DiscoveryCommunity
          communityID={'communityABC'}
          status={status}
          name="RootShare"
          numMembers={7042}
          numMutual={106}
        />
      );
    }

    return (
      <div>
        <RSText size={18} type="head" bold color={colors.primaryText}>
          Communities for you
        </RSText>
        {communities}
      </div>
    );
  }

  function renderPeople() {
    function removeSuggestion(userID: string) {
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

    const people: any = [];
    if (recommendedPeople.length === 0) return;

    const numSuggestionsDisplayed =
      recommendedPeople.length > 6 ? 6 : recommendedPeople.length;
    for (let i = 0; i < numSuggestionsDisplayed; i++) {
      const currSuggestion = recommendedPeople[i];
      people.push(
        <DiscoverySinglePerson
          userID={currSuggestion._id}
          name={`${currSuggestion['firstName']} ${currSuggestion['lastName']}`}
          position={currSuggestion['position']}
          company={currSuggestion['work']}
          numMutualConnections={currSuggestion['numMutualConnections']}
          _id={currSuggestion['_id']}
          removeSuggestion={removeSuggestion}
          accessToken={props.accessToken}
          refreshToken={props.refreshToken}
        />
      );
    }

    return people;
  }

  return (
    <div className={styles.wrapper} style={{ height: height }}>
      {renderCommunities()}
      {renderPeople()}
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
