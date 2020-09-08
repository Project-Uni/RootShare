import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Autocomplete } from '@material-ui/lab';
import { TextField, IconButton, CircularProgress } from '@material-ui/core';

import { FaSearch } from 'react-icons/fa';

import { connect } from 'react-redux';

import { colors } from '../../../theme/Colors';
import {
  WelcomeMessage,
  UserHighlight,
  CommunityHighlight,
} from '../../reusable-components';

import { ReniHeadshot } from '../../../images/team';
import PurdueHypeBanner from '../../../images/PurdueHypeAlt.png';
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
    background: colors.primaryText,
  },
  searchBarContainer: {
    display: 'flex',
    justifyContent: 'flex-start',
    marginLeft: 1,
    marginRight: 1,
    background: colors.primaryText,
  },
  resultsContainer: {},
  singleResult: {
    borderBottom: `1px solid ${colors.fourth}`,
    borderLeft: `1px solid ${colors.fourth}`,
    borderRight: `1px solid ${colors.fourth}`,
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
  type: string;
  description: string;
  private: boolean;
  university: { _id: string; universityName: string };
  profilePicture?: string;
  numMembers: number;
  numMutual: number;
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
};

type Props = {
  accessToken: string;
  refreshToken: string;
};

function DiscoverBody(props: Props) {
  const styles = useStyles();
  const [loading, setLoading] = useState(true);
  const [height, setHeight] = useState(window.innerHeight - HEADER_HEIGHT);
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);
  const [autocompleteResults, setAutocompleteResults] = useState([]);

  const [communities, setCommunities] = useState<DiscoverCommunity[]>([]);
  const [users, setUsers] = useState<DiscoverUser[]>([]);

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

  function handleResize() {
    setHeight(window.innerHeight - HEADER_HEIGHT);
  }

  function closeWelcomeMessage() {
    setShowWelcomeModal(false);
  }

  function randomShuffle(array: any[]) {}

  function renderSearchArea() {
    return (
      <div className={styles.searchBarContainer}>
        <Autocomplete
          freeSolo
          disableClearable
          options={autocompleteResults}
          className={styles.searchBar}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search for users or communities"
              variant="outlined"
              InputProps={{ ...params.InputProps, type: 'search' }}
            />
          )}
        />
        <IconButton>
          <FaSearch size={22} color={colors.primary} className={styles.searchIcon} />
        </IconButton>
      </div>
    );
  }

  function renderMockSearch() {
    const output = [];
    for (let i = 0; i < 3; i++) {
      output.push(
        <UserHighlight
          style={styles.singleResult}
          userID="testID"
          name="Reni Patel"
          profilePic={ReniHeadshot}
          university="Purdue"
          graduationYear={2020}
          position="Head of Alumni Relations"
          company="RootShare"
          mutualConnections={178}
          mutualCommunities={6}
          connected={i % 2 === 1}
        />
      );
      output.push(
        <CommunityHighlight
          style={styles.singleResult}
          communityID="testID"
          private
          name={'RootShare'}
          type="Business"
          description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque semper nisi sit amet ex tempor, non congue ex molestie. Sed et nulla mauris. In hac habitasse platea dictumst. Nullam ornare tellus bibendum enim volutpat fermentum. Nullam vulputate laoreet tristique. Nam a nibh eget tortor pulvinar placerat. Cras gravida scelerisque odio in vestibulum. Nunc id augue tortor. Aliquam faucibus facilisis tortor nec accumsan. Proin sed tincidunt purus. Praesent tempor nisl enim, et ornare arcu turpis."
          profilePicture={PurdueHypeBanner}
          memberCount={1498}
          mutualMemberCount={52}
          status="PENDING"
        />
      );
      output.push(
        <CommunityHighlight
          style={styles.singleResult}
          communityID="testID"
          name={'RootShare'}
          type="Business"
          description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque semper nisi sit amet ex tempor, non congue ex molestie. Sed et nulla mauris. In hac habitasse platea dictumst. Nullam ornare tellus bibendum enim volutpat fermentum. Nullam vulputate laoreet tristique. Nam a nibh eget tortor pulvinar placerat. Cras gravida scelerisque odio in vestibulum. Nunc id augue tortor. Aliquam faucibus facilisis tortor nec accumsan. Proin sed tincidunt purus. Praesent tempor nisl enim, et ornare arcu turpis."
          profilePicture={PurdueHypeBanner}
          memberCount={1498}
          mutualMemberCount={52}
          status="JOINED"
        />
      );
      output.push(
        <CommunityHighlight
          style={styles.singleResult}
          communityID="testID"
          private
          name={'RootShare'}
          type="Business"
          description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque semper nisi sit amet ex tempor, non congue ex molestie. Sed et nulla mauris. In hac habitasse platea dictumst. Nullam ornare tellus bibendum enim volutpat fermentum. Nullam vulputate laoreet tristique. Nam a nibh eget tortor pulvinar placerat. Cras gravida scelerisque odio in vestibulum. Nunc id augue tortor. Aliquam faucibus facilisis tortor nec accumsan. Proin sed tincidunt purus. Praesent tempor nisl enim, et ornare arcu turpis."
          profilePicture={PurdueHypeBanner}
          memberCount={1498}
          mutualMemberCount={52}
          status="OPEN"
        />
      );
    }
    return output;
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
          connected={true} //TODO - Fix
        />
      );
    }

    for (let i = 0; i < communities.length; i++) {
      output.push(
        <CommunityHighlight
          style={styles.singleResult}
          communityID={communities[i]._id}
          private={communities[i].private}
          name={communities[i].name}
          type={communities[i].type}
          description={communities[i].description}
          profilePicture={communities[i].profilePicture}
          memberCount={communities[i].numMembers}
          mutualMemberCount={communities[i].numMutual}
          status="OPEN" //TODO - Fix this
        />
      );
    }
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
          <div className={styles.resultsContainer}>{renderMockSearch()}</div>
        )}
      </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(DiscoverBody);
