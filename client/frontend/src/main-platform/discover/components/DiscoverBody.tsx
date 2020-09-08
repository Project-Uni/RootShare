import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Autocomplete } from '@material-ui/lab';
import { TextField, IconButton, CircularProgress } from '@material-ui/core';

import { FaSearch } from 'react-icons/fa';

import { connect } from 'react-redux';
import qs from 'query-string';

import {
  CommunityType,
  ProfileState,
  CommunityStatus,
} from '../../../helpers/types';

import { colors } from '../../../theme/Colors';
import {
  WelcomeMessage,
  UserHighlight,
  CommunityHighlight,
} from '../../reusable-components';

import { makeRequest } from '../../../helpers/functions';

const HEADER_HEIGHT = 60;

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    flex: 1,
    background: colors.primaryText,
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
    marginLeft: 1,
    marginRight: 1,
    background: colors.primaryText,
  },
  resultsContainer: {
    marginLeft: 1,
    marginRight: 1,
  },
  singleResult: {
    borderBottom: `1px solid ${colors.fourth}`,
  },
  searchIcon: {
    marginRight: 10,
  },
  loadingIndicator: {
    marginTop: 80,
    color: colors.primary,
  },
}));

type DiscoverCommunity = {
  _id: string;
  name: string;
  type: CommunityType;
  description: string;
  private: boolean;
  university: { _id: string; universityName: string };
  profilePicture?: string;
  admin: string;
  numMembers: number;
  numMutual: number;
  status: CommunityStatus;
};

type DiscoverUser = {
  _id: string;
  firstName: string;
  lastName: string;
  university: { _id: string; universityName: string };
  work?: string;
  position?: string;
  graduationYear?: number;
  profilePicture?: string;
  numMutualConnections: number;
  numMutualCommunities: number;
  status: ProfileState;
};

type Props = {
  user: { [key: string]: any };
  accessToken: string;
  refreshToken: string;
};

function DiscoverBody(props: Props) {
  const styles = useStyles();
  const [loading, setLoading] = useState(true);
  const [height, setHeight] = useState(window.innerHeight - HEADER_HEIGHT);
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);

  const [communities, setCommunities] = useState<DiscoverCommunity[]>([]);
  const [users, setUsers] = useState<DiscoverUser[]>([]);
  // const [renderList, setRenderList] = useState<JSX.Element[]>([]);

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
      setCommunities(data.content['communities']);
      setUsers(data.content['users']);
    }
  }

  async function makeSearch() {
    setLoading(true);
    const cleanedQuery = validateSearchQuery();
    if (!cleanedQuery) return;

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
      setCommunities(data.content['communities']);
      setUsers(data.content['users']);
    }
    setLoading(false);
  }

  function validateSearchQuery() {
    const cleanedQuery = searchValue.trim();
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

  function closeWelcomeMessage() {
    setShowWelcomeModal(false);
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
        />
        <IconButton onClick={makeSearch}>
          <FaSearch size={22} color={colors.primary} className={styles.searchIcon} />
        </IconButton>
      </div>
    );
  }

  function renderResults() {
    const output = [];
    for (let i = 0; i < users.length; i++) {
      output.push(
        <UserHighlight
          style={styles.singleResult}
          userID={users[i]._id}
          name={`${users[i].firstName} ${users[i].lastName}`}
          profilePic={users[i].profilePicture}
          university={users[i].university.universityName}
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

  return (
    <div className={styles.wrapper} style={{ height: height }}>
      {showWelcomeModal && (
        <WelcomeMessage
          title="Discovery"
          message="Find new communities to join, and people to connect to with"
          onClose={closeWelcomeMessage}
        />
      )}
      <div className={styles.body}>
        {renderSearchArea()}
        {loading ? (
          <CircularProgress size={100} className={styles.loadingIndicator} />
        ) : (
          <div className={styles.resultsContainer}>{renderResults()}</div>
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
