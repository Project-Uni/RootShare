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
import { UserType, UniversityType } from '../../../helpers/types';
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
  const [connections, setConnections] = useState<UserType[]>([]);
  const [username, setUsername] = useState('User');

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

    if (data.success === 1) setConnections(data.content['connections']);
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

    if (connections.length === 0)
      return (
        <RSText size={20} type="head" className={styles.noConnections}>
          {props.requestUserID === 'user' ? `You don't` : `${username} doesn't`} have
          any connections yet. Send a request!
        </RSText>
      );

    //TODO: Add logic in case an optional field does not exist
    for (let i = 0; i < connections.length; i++) {
      output.push(
        <UserHighlight
          name={`${connections[i].firstName} ${connections[i].lastName}`}
          userID={connections[i]._id}
          profilePic={connections[i].profilePicture}
          university={(connections[i].university as UniversityType).universityName}
          graduationYear={connections[i].graduationYear}
          position={connections[i].position}
          company={connections[i].work}
          mutualConnections={connections[i].numMutualConnections}
          mutualCommunities={connections[i].numMutualCommunities}
          style={styles.connectionStyle}
          status="CONNECTION"
        />
      );
    }
    return output;
  }

  return (
    <div
      className={styles.wrapper}
      style={{
        height: height,
        background:
          loading || connections.length === 0
            ? colors.primaryText
            : colors.background,
      }}
    >
      <Box boxShadow={2} borderRadius={10} className={styles.box}>
        <WelcomeMessage
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
