import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Autocomplete } from '@material-ui/lab';
import { TextField, IconButton, CircularProgress } from '@material-ui/core';

import { FaSearch } from 'react-icons/fa';

import { connect } from 'react-redux';

import { colors } from '../../../theme/Colors';
import { WelcomeMessage, UserHighlight } from '../../reusable-components';
import { SmitHeadshot } from '../../../images/team';

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
  },
  searchBarContainer: {
    display: 'flex',
    justifyContent: 'flex-start',
    marginLeft: 10,
    marginRight: 1,
    background: colors.primaryText,
  },
  connectionStyle: {
    marginLeft: 1,
    marginRight: 1,
    marginBottom: 1,
    borderRadius: 1,
  },
  searchIcon: {
    marginRight: 10,
  },
  loadingIndicator: {
    color: colors.primary,
    marginTop: 60,
  },
}));

type Props = {
  user: { [key: string]: any };
  accessToken: string;
  refreshToken: string;
};

function ConnectionsBody(props: Props) {
  const styles = useStyles();
  const [loading, setLoading] = useState(true);
  const [height, setHeight] = useState(window.innerHeight - HEADER_HEIGHT);
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);

  const [autocompleteResults, setAutocompleteResults] = useState(['Smit Desai']);
  const [connections, setConnections] = useState<{ [key: string]: any }>([]); //TODO: add type to connection
  const [connectionIDs, setConnectionIDs] = useState<{ [key: string]: any }>([]);
  const [joinedCommunities, setJoinedCommunities] = useState<{
    [key: string]: any;
  }>([]);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    fetchData().then(() => {
      setLoading(false);
    });
  }, []);

  async function fetchData() {
    const { data } = await makeRequest(
      'GET',
      `/api/user/${props.user._id}/connections`,
      {},
      true,
      props.accessToken,
      props.refreshToken
    );
    if (data.success === 1) {
      setConnections(data.content['connections']);
      setConnectionIDs(data.content['connectionIDs']);
      setJoinedCommunities(data.content['joinedCommunities']);
    }
  }

  function handleResize() {
    setHeight(window.innerHeight - HEADER_HEIGHT);
  }

  function closeWelcomeMessage() {
    setShowWelcomeModal(false);
  }

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
              label="Search your connections"
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

  function renderConnections() {
    const output = [];

    //TODO: Add logic in case an optional field does not exist
    for (let i = 0; i < connections.length; i++) {
      const potentialMutualConnections = connections[i].connections.reduce(
        (
          extractedConnections: string[],
          connection: { from: string; to: string }
        ) => {
          const otherID =
            connection['from'].toString() != connections[i].toString()
              ? connection['from']
              : connection['to'];

          extractedConnections.push(otherID);

          return extractedConnections;
        },
        []
      );
      let mutualConnections = connectionIDs.filter((x: string) =>
        potentialMutualConnections.includes(x)
      );
      let mutualCommunities = joinedCommunities.filter((x: string) =>
        connections[i].joinedCommunities.includes(x)
      );
      output.push(
        <div style={{ borderBottom: `1px solid ${colors.fourth}` }}>
          <UserHighlight
            name={`${connections[i].firstName} ${connections[i].lastName}`}
            userID={connections[i]._id}
            profilePic={connections[i].profilePicture}
            university={connections[i].university.universityName}
            graduationYear={connections[i].graduationYear}
            position={connections[i].position}
            company={connections[i].work}
            mutualConnections={mutualConnections.length}
            mutualCommunities={mutualCommunities.length}
            style={styles.connectionStyle}
            status="PUBLIC"
          />
        </div>
      );
    }
    return output;
  }

  return (
    <div className={styles.wrapper} style={{ height: height }}>
      {showWelcomeModal && (
        <WelcomeMessage
          title="Connections"
          message="See all of the people you have connected with, plus all of the people who have requested to connect with you!"
          onClose={closeWelcomeMessage}
        />
      )}
      <div className={styles.body}>
        {renderSearchArea()}
        {loading ? (
          <CircularProgress size={100} className={styles.loadingIndicator} />
        ) : (
          renderConnections()
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

export default connect(mapStateToProps, mapDispatchToProps)(ConnectionsBody);
