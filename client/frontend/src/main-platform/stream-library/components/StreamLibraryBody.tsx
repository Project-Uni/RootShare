import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { TextField, IconButton } from '@material-ui/core';

import { FaSearch } from 'react-icons/fa';

import { colors } from '../../../theme/Colors';
import { WelcomeMessage } from '../../reusable-components';
import Stream from './Stream';

import { HEADER_HEIGHT } from '../../../helpers/constants';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    flex: 1,
    background: colors.fourth,
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
    background: colors.primaryText,
  },
  stream: {
    marginLeft: 1,
    marginRight: 1,
    marginTop: 1,
    paddingBottom: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
}));

type Props = {};

function StreamLibraryBody(props: Props) {
  const styles = useStyles();
  const [loading, setLoading] = useState(true);
  const [height, setHeight] = useState(window.innerHeight - HEADER_HEIGHT);

  const [searchedValue, setSearchedValue] = useState('');

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

  function handleSearchChange(event: any) {
    setSearchedValue(event.target.value);
  }

  function handleSearchClicked() {
    console.log(`Searching for ${searchedValue}`);
  }

  function renderSearchbar() {
    return (
      <div className={styles.searchBarContainer}>
        <TextField
          label="Search for previous streams"
          variant="outlined"
          className={styles.searchBar}
          value={searchedValue}
          onChange={handleSearchChange}
        />
        <IconButton onClick={handleSearchClicked}>
          <FaSearch size={22} color={colors.primary} className={styles.searchIcon} />
        </IconButton>
      </div>
    );
  }

  function renderStreams() {
    const output = [];
    for (let i = 0; i < 8; i++) {
      output.push(
        <Stream
          eventID="testID"
          eventTitle="The Baby Boilers Are Back"
          eventDesc="The Baby Boilers return for a once in a lifetime event. Prepare to be amazed as you watch what they have been up to sinc their time at Purdue!! The Baby Boilers return for a once in a lifetime event. Prepare to be amazed as you watch what they have been up to sinc their time at Purdue!! "
          eventHostName="RootShare"
          eventHostID="testID"
          eventDate="Aug 14, 2020"
          className={styles.stream}
          liked={i % 3 == 0}
        />
      );
    }
    return output;
  }

  return (
    <div className={styles.wrapper} style={{ height: height }}>
      <WelcomeMessage
        title="Video Library"
        message="Previous events hosted on RootShare are visible here for your on-demand viewing."
      />
      <div className={styles.body}>
        {renderSearchbar()}
        {renderStreams()}
      </div>
    </div>
  );
}

export default StreamLibraryBody;
