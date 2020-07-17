import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Autocomplete } from '@material-ui/lab';
import { TextField, IconButton } from '@material-ui/core';

import { FaSearch } from 'react-icons/fa';

import { colors } from '../../../theme/Colors';
import WelcomeMessage from './WelcomeMessage';

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
}));

type Props = {};

function Template(props: Props) {
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

  return (
    <div className={styles.wrapper} style={{ height: height }}>
      {showWelcomeModal && <WelcomeMessage onClose={closeWelcomeMessage} />}
      <div className={styles.body}>
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
      </div>
    </div>
  );
}

export default Template;
