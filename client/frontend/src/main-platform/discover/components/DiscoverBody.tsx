import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { TextField, IconButton, CircularProgress, Box } from '@material-ui/core';

import { FaSearch } from 'react-icons/fa';

import { connect } from 'react-redux';
import qs from 'query-string';

import { colors } from '../../../theme/Colors';
import RSText from '../../../base-components/RSText';
import {
  WelcomeMessage,
  UserHighlight,
  CommunityHighlight,
} from '../../reusable-components';

import { makeRequest } from '../../../helpers/functions';
import { DiscoverCommunity, DiscoverUser } from '../../../helpers/types';
import { ENTER_KEYCODE, HEADER_HEIGHT } from '../../../helpers/constants';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    flex: 1,
    background: colors.background,
    overflow: 'scroll',
  },
  body: {},
  searchBar: {
    flex: 1,
    marginRight: 10,
    marginLeft: 15,
    background: colors.primaryText,
  },
  searchBarContainer: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginLeft: 1,
    marginRight: 1,
    marginTop: 8,
    paddingBottom: 10,
  },
  resultsContainer: {
    marginLeft: 1,
    marginRight: 1,
    paddingTop: 1,
  },
  singleResult: {
    margin: 8,
  },
  searchIcon: {
    marginRight: 10,
  },
  loadingIndicator: {
    marginTop: 80,
    color: colors.primary,
  },
  noResultsText: {
    marginTop: 25,
  },
  searchButton: {
    marginTop: 7,
  },
  box: {
    background: colors.primaryText,
    margin: 8,
  },
}));

type Props = {
  user: { [key: string]: any };
  accessToken: string;
  refreshToken: string;
};

function DiscoverBody(props: Props) {
  const styles = useStyles();
  const [loading, setLoading] = useState(true);
  const [height, setHeight] = useState(window.innerHeight - HEADER_HEIGHT);

  const [renderList, setRenderList] = useState<JSX.Element[]>([]);

  const [searchValue, setSearchValue] = useState('');
  const [searchErr, setSearchErr] = useState('');

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    fetchData().then(() => {
      setLoading(false);
    });
  }, []);

  async function fetchData() {
    const { data } = await makeRequest(
      'GET',
      '/api/discover/populate',
      {},
      true,
      props.accessToken,
      props.refreshToken
    );
    if (data.success === 1) {
      const { users, communities } = data.content;
      setRenderList(generateResults(users, communities));
    }
  }

  async function makeSearch() {
    setLoading(true);
    const cleanedQuery = validateSearchQuery();
    if (!cleanedQuery) return setLoading(false);

    const query = qs.stringify({ query: cleanedQuery });
    const { data } = await makeRequest(
      'GET',
      `/api/discover/search/v1/exactMatch?${query}`,
      {},
      true,
      props.accessToken,
      props.refreshToken
    );
    if (data.success === 1) {
      const { users, communities } = data.content;
      setRenderList(generateResults(users, communities));
    }
    setLoading(false);
  }

  function validateSearchQuery() {
    const withRemoved = searchValue.replace(/\?/g, ' ');
    const cleanedQuery = withRemoved.trim();
    if (cleanedQuery.length < 3) {
      setSearchErr('Please search for atleast 3 characters.');
      return false;
    }
    setSearchErr('');
    return cleanedQuery;
  }

  function handleResize() {
    setHeight(window.innerHeight - HEADER_HEIGHT);
  }

  function randomShuffle(array: any[]) {
    const iterations = 3;
    for (let i = 0; i < iterations; i++) {
      for (let j = 0; j < array.length; j++) {
        const swapIndex = Math.floor(Math.random() * array.length);

        const temp = array[swapIndex];
        array[swapIndex] = array[j];
        array[j] = temp;
      }
    }
  }

  function handleSearchChange(event: any) {
    setSearchValue(event.target.value);
  }

  function handleKeyDown(event: any) {
    if (event.keyCode === ENTER_KEYCODE) {
      event.preventDefault();
      makeSearch();
    }
  }

  function generateResults(users: DiscoverUser[], communities: DiscoverCommunity[]) {
    const output = [];
    for (let i = 0; i < users.length; i++) {
      output.push(
        <UserHighlight
          style={styles.singleResult}
          userID={users[i]._id}
          name={`${users[i].firstName} ${users[i].lastName}`}
          profilePic={users[i].profilePicture}
          university={users[i].university?.universityName}
          graduationYear={users[i].graduationYear}
          position={users[i].position}
          company={users[i].work}
          mutualConnections={users[i].numMutualConnections}
          mutualCommunities={users[i].numMutualCommunities}
          status={users[i].status}
        />
      );
    }

    for (let i = 0; i < communities.length; i++) {
      output.push(
        <CommunityHighlight
          userID={props.user._id}
          style={styles.singleResult}
          communityID={communities[i]._id}
          private={communities[i].private}
          name={communities[i].name}
          type={communities[i].type}
          description={communities[i].description}
          profilePicture={communities[i].profilePicture}
          memberCount={communities[i].numMembers}
          mutualMemberCount={communities[i].numMutual}
          status={communities[i].status}
          admin={communities[i].admin}
        />
      );
    }

    randomShuffle(output);
    return output;
  }

  function renderSearchArea() {
    return (
      <div className={styles.searchBarContainer}>
        <TextField
          label="Search for users and communities"
          className={styles.searchBar}
          variant="outlined"
          value={searchValue}
          onChange={handleSearchChange}
          error={searchErr !== ''}
          helperText={searchErr}
          onKeyDown={handleKeyDown}
        />
        <IconButton onClick={makeSearch} className={styles.searchButton}>
          <FaSearch size={22} color={colors.primary} className={styles.searchIcon} />
        </IconButton>
      </div>
    );
  }

  function renderNoResults() {
    return (
      <RSText
        type="head"
        size={18}
        color={colors.primary}
        className={styles.noResultsText}
      >
        No results found.
      </RSText>
    );
  }

  return (
    <div className={styles.wrapper} style={{ height: height }}>
      <Box boxShadow={2} borderRadius={10} className={styles.box}>
        <WelcomeMessage
          title="Discovery"
          message="Find new communities to join, and people to connect to with"
        />
        {renderSearchArea()}
      </Box>
      <div className={styles.body}>
        {loading ? (
          <CircularProgress size={100} className={styles.loadingIndicator} />
        ) : (
          <div className={styles.resultsContainer}>
            {renderList.length > 0 ? renderList : renderNoResults()}
          </div>
        )}
      </div>
    </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(DiscoverBody);
