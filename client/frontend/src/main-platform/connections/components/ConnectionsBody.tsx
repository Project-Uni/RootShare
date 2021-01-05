import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';

import { Autocomplete } from '@material-ui/lab';
import { TextField, IconButton, CircularProgress, Box } from '@material-ui/core';

import { FaSearch } from 'react-icons/fa';

import { colors } from '../../../theme/Colors';
import { WelcomeMessage, UserHighlight } from '../../reusable-components';
import { RSText } from '../../../base-components';

import { makeRequest } from '../../../helpers/functions';
import { DiscoverUser, UniversityType } from '../../../helpers/types';

import { HEADER_HEIGHT } from '../../../helpers/constants';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    flex: 1,
    overflow: 'scroll',
  },
  body: {},
  searchBar: {
    flex: 1,
    marginRight: 10,
    marginLeft: 10,
  },
  searchBarContainer: {
    display: 'flex',
    justifyContent: 'flex-start',
    paddingLeft: 10,
    paddingRight: 1,
    paddingBottom: 10,
  },
  noConnections: {
    marginTop: 30,
  },
  connectionStyle: {
    margin: 8,
  },
  searchIcon: {
    marginRight: 10,
  },
  loadingIndicator: {
    color: colors.primary,
    marginTop: 60,
  },
  box: {
    margin: 8,
    background: colors.primaryText,
  },
}));

type Props = {
  requestUserID: string;

  user: { [key: string]: any };
  accessToken: string;
  refreshToken: string;
};

function ConnectionsBody(props: Props) {
  const styles = useStyles();
  const [loading, setLoading] = useState(true);
  const [height, setHeight] = useState(window.innerHeight - HEADER_HEIGHT);

  const [autocompleteResults, setAutocompleteResults] = useState(['Smit Desai']);
  const [connections, setConnections] = useState<DiscoverUser[]>([]);
  const [pendingConnections, setPendingConnections] = useState<DiscoverUser[]>([]);
  const [username, setUsername] = useState('User');
  const [numConnections, setNumConnections] = useState(null);
  
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    if (props.requestUserID !== 'user') fetchUserBasicInfo();
    fetchData().then(() => {
      setLoading(false);
    });
  }, []);

  async function fetchData() {
    const { data } = await makeRequest(
      'GET',
      `/api/user/${
        props.requestUserID === 'user' ? props.user._id : props.requestUserID
      }/connections`,
      {},
      true,
      props.accessToken,
      props.refreshToken
    );

    if (data.success === 1) {
      setConnections(data.content['connections']);
      setPendingConnections(data.content['pendingConnections']);
      
    }
  }

  async function fetchUserBasicInfo() {
    const { data } = await makeRequest(
      'GET',
      `/api/user/${props.requestUserID}/basic`,
      {},
      true,
      props.accessToken,
      props.refreshToken
    );
    if (data.success === 1) {
      setUsername(`${data.content.user?.firstName}`);
    }
  }

  function handleResize() {
    setHeight(window.innerHeight - HEADER_HEIGHT);
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
              label={`Search ${
                props.requestUserID === 'user' ? 'your' : `${username}'s`
              } connections`}
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

  function renderPending() {
    const output = [];

    //TODO: Add logic in case an optional field does not exist
    for (let i = 0; i < pendingConnections.length; i++) {
      const currPending: DiscoverUser = pendingConnections[i];
      output.push(
        <UserHighlight
          name={`${currPending.firstName} ${currPending.lastName}`}
          userID={currPending._id}
          profilePic={currPending.profilePicture}
          university={(currPending.university as UniversityType).universityName}
          graduationYear={currPending.graduationYear}
          position={currPending.position}
          company={currPending.work}
          mutualConnections={currPending.numMutualConnections}
          mutualCommunities={currPending.numMutualCommunities}
          style={styles.connectionStyle}
          status={currPending.status}
          connectionRequestID={currPending.connectionRequestID}
          numConnections={numConnections}
          setNumConnections={setNumConnections}
        />
      );
    }
    return output;
  }

  function renderConnections() {
    const output = [];
    
    if (connections.length === 0)
      return (
        <RSText size={20} type="head" className={styles.noConnections}>
          {props.requestUserID === 'user' ? `You don't` : `${username} doesn't`} have
          any connections yet. Send a request!
        </RSText>
      );

    //TODO: Add logic in case an optional field does not exist
    let i = 0;
    for (; i < connections.length; i++) {
      const currConnection: DiscoverUser = connections[i];
      output.push(
        <UserHighlight
          name={`${currConnection.firstName} ${currConnection.lastName}`}
          userID={currConnection._id}
          profilePic={currConnection.profilePicture}
          university={(currConnection.university as UniversityType).universityName}
          graduationYear={currConnection.graduationYear}
          position={currConnection.position}
          company={currConnection.work}
          mutualConnections={currConnection.numMutualConnections}
          mutualCommunities={currConnection.numMutualCommunities}
          style={styles.connectionStyle}
          status={currConnection.status}
          connectionRequestID={currConnection.connectionRequestID}
        />
      );
    }

    if (connections.length > numConnections) {
      if (connections.length > 0) {
        setNumConnections(connections.length);
      }
      else {
        setNumConnections(null);
      }
    }

    return output;
  }

  return (
    <div
      className={styles.wrapper}
      style={{
        height: height,
        background: colors.background,
      }}
    >
      <Box boxShadow={2} borderRadius={10} className={styles.box}>
        <WelcomeMessage
          counter={`${numConnections === null ? ' ' : `${numConnections}`}`}
          title={`${
            props.requestUserID === 'user' ? 'Your' : `${username}\'s`
          } Connections`}
          message={`See all of the people that ${
            props.requestUserID === 'user' ? 'you have' : `${username} has`
          } connected with!`}
        />
        {renderSearchArea()}
      </Box>
      <div className={styles.body}>
        {loading ? (
          <CircularProgress size={100} className={styles.loadingIndicator} />
        ) : (
          <div>
            {renderConnections()}
            {renderPending()}
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

export default connect(mapStateToProps, mapDispatchToProps)(ConnectionsBody);
