import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Autocomplete } from '@material-ui/lab';
import { TextField, IconButton } from '@material-ui/core';

import { FaSearch } from 'react-icons/fa';

import { colors } from '../../../theme/Colors';
import { WelcomeMessage, UserHighlight } from '../../reusable-components';
import { SmitHeadshot } from '../../../images/team';

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
    marginLeft: 20,
    marginRight: 20,
  },
  connectionStyle: {
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 10,
  },
}));

type Props = {};

function ConnectionsBody(props: Props) {
  const styles = useStyles();
  const [loading, setLoading] = useState(true);
  const [height, setHeight] = useState(window.innerHeight - HEADER_HEIGHT);
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);

  const [autocompleteResults, setAutocompleteResults] = useState(['Smit Desai']);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    fetchData().then(() => {
      setLoading(false);
    });
  }, []);

  async function fetchData() {
    console.log('Fetching data');
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
              margin="normal"
              variant="outlined"
              InputProps={{ ...params.InputProps, type: 'search' }}
            />
          )}
        />
        <IconButton>
          <FaSearch size={22} color={colors.primary} />
        </IconButton>
      </div>
    );
  }

  function renderConnections() {
    const output = [];
    for (let i = 0; i < 10; i++)
      output.push(
        <UserHighlight
          name="Smit Desai"
          userID="testID"
          profilePic={SmitHeadshot}
          university="University of Illinois"
          graduationYear={2020}
          position="Head of Architecture"
          company="RootShare"
          mutualConnections={32}
          mutualCommunities={4}
          style={styles.connectionStyle}
          connected
        />
      );
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
        {renderConnections()}
      </div>
    </div>
  );
}

export default ConnectionsBody;
