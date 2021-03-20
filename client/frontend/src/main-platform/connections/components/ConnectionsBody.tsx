import React, { useState, useEffect, useCallback } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector } from 'react-redux';

import { Autocomplete } from '@material-ui/lab';
import { TextField, IconButton, CircularProgress, Box } from '@material-ui/core';

import { FaSearch } from 'react-icons/fa';

import { WelcomeMessage, UserHighlight } from '../../reusable-components';
import { RSText } from '../../../base-components';

import { makeRequest } from '../../../helpers/functions';
import { DiscoverUser, UniversityType, U2UR } from '../../../helpers/types';

import Theme from '../../../theme/Theme';
import { RootshareReduxState } from '../../../redux/store/stateManagement';
import { useParams } from 'react-router-dom';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    height: '100%',
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
    color: Theme.bright,
    marginTop: 60,
  },
  box: {
    margin: 8,
    background: Theme.altText,
  },
}));

type Props = {};

export default function ConnectionsBody(props: Props) {
  const styles = useStyles();
  const { _id: userID } = useSelector((state: RootshareReduxState) => state.user);

  const [loading, setLoading] = useState(true);

  const [autocompleteResults, setAutocompleteResults] = useState(['']);
  const [connections, setConnections] = useState<DiscoverUser[]>([]);
  const [pendingConnections, setPendingConnections] = useState<DiscoverUser[]>([]);
  const [username, setUsername] = useState('User');

  const { userID: requestUserID } = useParams<{ userID: string }>();

  const fetchData = useCallback(async () => {
    const { data } = await makeRequest(
      'GET',
      `/api/user/${requestUserID === 'user' ? userID : requestUserID}/connections`
    );

    if (data.success === 1) {
      setConnections(data.content['connections']);
      setPendingConnections(data.content['pendingConnections']);
    }
  }, [requestUserID]);

  useEffect(() => {
    if (!loading) setLoading(true);
    if (requestUserID !== 'user') fetchUserBasicInfo();
    fetchData().then(() => {
      setLoading(false);
    });
  }, [fetchData]);

  async function fetchUserBasicInfo() {
    const { data } = await makeRequest('GET', `/api/user/${requestUserID}/basic`);
    if (data.success === 1) {
      setUsername(`${data.content.user?.firstName}`);
    }
  }

  function updateConnectionStatus(connectionRequestID: string) {
    for (let i = 0; i < pendingConnections.length; i++) {
      let currPending = pendingConnections[i];
      if (currPending.connectionRequestID === connectionRequestID) {
        currPending.status = U2UR.CONNECTED;
        setConnections((prevConnections) => prevConnections.concat(currPending));
        setPendingConnections((prevPending) => {
          let newPending = prevPending;
          for (let i = 0; i < newPending.length; i++)
            if (newPending[i].connectionRequestID === connectionRequestID)
              newPending.splice(i, 1);

          return newPending;
        });

        return;
      }
    }
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
                requestUserID === 'user' ? 'your' : `${username}'s`
              } connections`}
              variant="outlined"
              InputProps={{ ...params.InputProps, type: 'search' }}
            />
          )}
        />
        <IconButton>
          <FaSearch size={22} color={Theme.primary} className={styles.searchIcon} />
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
          updateConnectionStatus={updateConnectionStatus}
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
          {requestUserID === 'user' ? `You don't` : `${username} doesn't`} have any
          connections yet. Send a request!
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

    return output;
  }

  return (
    <div className={styles.wrapper}>
      <Box boxShadow={2} borderRadius={10} className={styles.box}>
        <WelcomeMessage
          counter={connections.length}
          title={`${
            requestUserID === 'user' ? 'Your' : `${username}\'s`
          } Connections`}
          message={`See all of the people that ${
            requestUserID === 'user' ? 'you have' : `${username} has`
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
