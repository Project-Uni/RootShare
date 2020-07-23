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
import { ReniHeadshot } from '../../../images/team';
import PurdueHypeBanner from '../../../images/PurdueHypeAlt.png';

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
