import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { TextField, IconButton, Box, CircularProgress } from '@material-ui/core';

import { FaSearch } from 'react-icons/fa';

import { SearchUserType } from '../../../helpers/types';
import { ENTER_KEYCODE } from '../../../helpers/constants';

import { UserHighlight } from '../../reusable-components';
import { colors } from '../../../theme/Colors';

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
  singleMember: {
    margin: 8,
  },
  searchBar: {
    flex: 1,
    marginRight: 10,
    marginLeft: 15,
  },
  searchBarContainer: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginLeft: 1,
    marginRight: 1,
    marginTop: 8,
    paddingBottom: 20,
    paddingTop: 20,
  },
  searchButton: {
    marginTop: 7,
  },
  searchIcon: {
    marginRight: 10,
  },
  box: {
    margin: 8,
    background: colors.primaryText,
  },
  loadingIndicator: {
    marginTop: 75,
    color: colors.primary,
  },
}));

type Props = {
  members: SearchUserType[];
};

function CommunityMembers(props: Props) {
  const styles = useStyles();

  const [loading, setLoading] = useState(false);
  const [allMembers, setAllMembers] = useState(props.members);
  const [shownMembers, setShownMembers] = useState(props.members);
  const [searchValue, setSearchValue] = useState('');
  const [searchErr, setSearchErr] = useState('');

  function handleSearchChange(event: any) {
    setSearchValue(event.target.value);
  }

  function handleKeyDown(event: any) {
    if (event.keyCode === ENTER_KEYCODE) {
      event.preventDefault();
      makeSearch();
    }
  }

  function makeSearch() {
    if (searchValue === '') {
      setShownMembers(allMembers);
      return;
    }
    setLoading(true);
    const lowercaseSearch = searchValue.toLowerCase(); //Ashwin - tried doing this with regex, but it was bugging out, so just doing it manually for now
    const matches = allMembers.filter((member) => {
      return `${member.firstName} ${member.lastName}`
        .toLowerCase()
        .includes(lowercaseSearch);
    });
    setShownMembers(matches);
    setLoading(false);
  }

  function renderSearchArea() {
    return (
      <div className={styles.searchBarContainer}>
        <TextField
          label="Search for users and communities"
          className={styles.searchBar}
          variant="outlined"
          value={searchValue}
          onChange={handleSearchChange}
          error={searchErr !== ''}
          helperText={searchErr}
          onKeyDown={handleKeyDown}
        />
        <IconButton className={styles.searchButton} onClick={makeSearch}>
          <FaSearch size={22} color={colors.primary} className={styles.searchIcon} />
        </IconButton>
      </div>
    );
  }

  function generateMembers() {
    const output = [];
    for (let i = 0; i < shownMembers.length; i++) {
      const member = shownMembers[i];
      output.push(
        <UserHighlight
          userID={member._id}
          profilePic={member.profilePicture}
          name={`${member.firstName} ${member.lastName}`}
          university={member.university.universityName}
          graduationYear={member.graduationYear}
          position={member.position}
          company={member.work}
          mutualConnections={member.numMutualConnections}
          mutualCommunities={member.numMutualCommunities}
          status={member.status}
          style={styles.singleMember}
        />
      );
    }
    return output;
  }

  return (
    <div className={styles.wrapper}>
      <Box boxShadow={2} borderRadius={10} className={styles.box}>
        {renderSearchArea()}
      </Box>
      {loading ? (
        <CircularProgress size={100} className={styles.loadingIndicator} />
      ) : (
        generateMembers()
      )}
    </div>
  );
}

export default CommunityMembers;
