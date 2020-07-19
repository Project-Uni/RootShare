import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Autocomplete } from '@material-ui/lab';
import { TextField, IconButton } from '@material-ui/core';

import { FaSearch } from 'react-icons/fa';

import { colors } from '../../../theme/Colors';
import {
  WelcomeMessage,
  UserHighlight,
  CommunityHighlight,
} from '../../reusable-components';

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
  resultsContainer: {},
  singleResult: {
    marginTop: 10,
    marginLeft: 20,
    marginRight: 20,
  },
}));

type Props = {};

function DiscoverBody(props: Props) {
  const styles = useStyles();
  const [loading, setLoading] = useState(true);
  const [height, setHeight] = useState(window.innerHeight - HEADER_HEIGHT);
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);
  const [autocompleteResults, setAutocompleteResults] = useState([]);

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
              label="Search for users or communities"
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

  function renderMockSearch() {
    const output = [];
    for (let i = 0; i < 1; i++) {
      output.push(<UserHighlight style={styles.singleResult} userID="testID" />);
      output.push(
        <CommunityHighlight style={styles.singleResult} communityID="testID" />
      );
    }
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
        <div className={styles.resultsContainer}>{renderMockSearch()}</div>
      </div>
    </div>
  );
}

export default DiscoverBody;
