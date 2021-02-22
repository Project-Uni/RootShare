import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { 
  CircularProgress,
  Box,
  TextField,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  MenuItem,
} from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import { FaSearch } from 'react-icons/fa';

import { connect } from 'react-redux';

import { RSTabs, WelcomeMessage } from '../../reusable-components';
import CommunityHighlight from '../../reusable-components/components/CommunityHighlight';
import CreateCommunityModal from './CreateCommunityModal';
import { RSText } from '../../../base-components';

import { getCommunitiesUniversity } from '../../../api';
import { makeRequest } from '../../../helpers/functions';
import { Community, CommunityType, COMMUNITY_TYPES } from '../../../helpers/types';
import { HEADER_HEIGHT } from '../../../helpers/constants';
import { U2CR } from '../../../helpers/types';
import Theme from '../../../theme/Theme';
import { User } from '@styled-icons/boxicons-solid';

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
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
  searchIcon: {
    marginRight: 10,
  },
  communitySelect: {
    width: 225,
    textAlign: 'left',
  },
  communitySelectDiv: {
    display: 'flex',
    justifyContent: 'flex-start',
  },
  noCommunities: {
    marginTop: 30,
  },
  singleCommunity: {
    margin: 8,
  },
  loadingIndicator: {
    marginTop: 80,
    color: Theme.bright,
  },
  box: {
    background: Theme.white,
    margin: 8,
    height: 250,
  },
  tabs: {
    marginLeft: 5,
    marginRight: 5,
    marginBottom: 5,
  },
}));

type CommunityResponse = {
  communities: (Community & {
    [k: string]: unknown;
  })[];
};

type Props = {
  user: { [key: string]: any };
  match: {
    params: { [key: string]: any };
    [key: string]: any;
  };
};

function YourCommunitiesBody(props: Props) {
  const styles = useStyles();
  const [loading, setLoading] = useState(true);
  const [height, setHeight] = useState(window.innerHeight - HEADER_HEIGHT);

  const [autocompleteResults, setAutocompleteResults] = useState(['Smit Desai']);

  const [username, setUsername] = useState('User');
  const [university, setUniversity] = useState('University');
  const [universityName, setUniversityName] = useState('University');

  const [joinedCommunities, setJoinedCommunities] = useState<Community[]>([]);
  const [pendingCommunities, setPendingCommunities] = useState<Community[]>([]);

  const [communityFeed, setCommunityFeed] = useState<JSX.Element[]>([]);

  const [showCreateCommunitiesModal, setShowCreateCommunitiesModal] = useState(
    false
  );

  const [type, setType] = useState<CommunityType>();
  const [typeErr, setTypeErr] = useState('');

  const [selectedTab, setSelectedTab] = useState('following');

  const requestUserID = props.match.params['userID'];

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    fetchUserBasicInfo();
    getCommunityFeed().then(() => {
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    getCommunityFeed().then(() => {
      setLoading(false);
    });
  }, [selectedTab]);

  async function getCommunityFeed() {
    let feed = [];
    if (selectedTab == 'following') {
      await fetchFollowingData();
    }
    else {
      await fetchDiscoverData();
    }
  }

  function handleCommunityTypeChange(event: any) {
    setType(event.target.value);
  }

  async function fetchFollowingData() {
    const { data } = await makeRequest(
      'GET',
      `/api/user/${
         requestUserID === 'user' ? props.user._id : requestUserID
      }/communities/all`
    );
    if (data.success === 1) {
      setCommunityFeed(renderFollowing(
        data.content['joinedCommunities'],
        data.content['pendingCommunities']));
      //Loading joined/pending for appending
      setJoinedCommunities(data.content['joinedCommunities']);
      setPendingCommunities(data.content['pendingCommunities']);
    }
  }

  async function fetchDiscoverData() {
    const data = await getCommunitiesUniversity<CommunityResponse>(university, {
      fields: [
        'private',
        '_id',
        'name',
        'description',
        'type',
        'admin',
        'members',
        'profilePicture'
      ],
      options: {
        //limit: 100,
        getProfilePicture: true,
        getBannerPicture: false,
        getRelationship: false,
        includeDefaultFields: false,
      },
    });

    if (data.success === 1) {
      setCommunityFeed(renderDiscover((data.content as CommunityResponse).communities));
    }
  }

  async function fetchUserBasicInfo() {
    const { data } = 
      requestUserID !== 'user' ?
        await makeRequest('GET', `/api/user/${requestUserID}/basic`) :
        await makeRequest('GET', `/api/user/profile/user`)
    if (data.success === 1) {
      if (requestUserID !== 'user'){
        setUsername(`${data.content.user?.firstName}`);
      } else {
        setUniversityName(`${data.content.user?.university.universityName}`);
        setUniversity(`${data.content.user?.university._id}`);
      }
    }
  }

  function handleResize() {
    setHeight(window.innerHeight - HEADER_HEIGHT);
  }

  function handleTabChange(newTab: string) {
    setSelectedTab(newTab);
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
                requestUserID === 'user' ? `${universityName}'s` : `${username}'s`
              } communities`}
              variant="outlined"
              InputProps={{ ...params.InputProps, type: 'search' }}
            />
          )}
        />
        <IconButton>
          <FaSearch size={22} color={Theme.primary} className={styles.searchIcon} />
        </IconButton>
        <div className={styles.communitySelectDiv}>
        <FormControl
          className={styles.communitySelect}
          variant="outlined"
          error={typeErr !== ''}
        >
          <InputLabel>Type</InputLabel>
          <Select value={type} onChange={handleCommunityTypeChange}>
            {COMMUNITY_TYPES.map((communityType) => (
              <MenuItem value={communityType} key={communityType}>
                {communityType}
              </MenuItem>
            ))}
          </Select>
          {typeErr !== '' && <FormHelperText>{typeErr}</FormHelperText>}
        </FormControl>
      </div>
      </div>
    );
  }

  function appendNewCommunity(community: Community) {
    setJoinedCommunities([community, ...joinedCommunities]);
    setCommunityFeed(renderFollowing(
      joinedCommunities,
      pendingCommunities));
  }

  function calculateMemberData(community: Community) {
    let isMember = false;
    community.numMembers = community.members.length;
    for (let i = 0; i < community.members.length; i++) {
      if (props.user._id == community.members[i])
        isMember = true;
    }
    if (isMember)
      community.status = U2CR.JOINED;
    else
      community.status = U2CR.OPEN;
  }

  function renderDiscover(community: Community[]) {
    const output = [];
    for (let i = 0; i < community.length; i++) {
      const currCommunity = community[i];
      calculateMemberData(currCommunity);
      output.push(
        <CommunityHighlight
          userID={props.user._id}
          style={styles.singleCommunity}
          communityID={currCommunity._id}
          private={currCommunity.private}
          name={currCommunity.name}
          type={currCommunity.type}
          description={currCommunity.description}
          profilePicture={currCommunity.profilePicture}
          memberCount={currCommunity.numMembers!}
          mutualMemberCount={currCommunity.numMutual!}
          status={currCommunity.status}
          admin={currCommunity.admin as string}
        />
      );
    }
    return output;
  }

  function renderFollowing(joined: Community[], pending: Community[]) {
    const output = [];
    //Joined Communities
    for (let i = 0; i < joined.length; i++) {
      const currCommunity = joined[i];
      output.push(
        <CommunityHighlight
          userID={props.user._id}
          style={styles.singleCommunity}
          communityID={currCommunity._id}
          private={currCommunity.private}
          name={currCommunity.name}
          type={currCommunity.type}
          description={currCommunity.description}
          profilePicture={currCommunity.profilePicture}
          memberCount={currCommunity.numMembers!}
          mutualMemberCount={currCommunity.numMutual!}
          status={currCommunity.status}
          admin={currCommunity.admin as string}
        />
      );
    }

    //Pending Communities
    for (let i = 0; i < pending.length; i++) {
      const currCommunity = pending[i];
      output.push(
        <CommunityHighlight
          userID={props.user._id}
          style={styles.singleCommunity}
          communityID={currCommunity._id}
          private={currCommunity.private}
          name={currCommunity.name}
          type={currCommunity.type}
          description={currCommunity.description}
          profilePicture={currCommunity.profilePicture}
          memberCount={currCommunity.numMembers!}
          mutualMemberCount={currCommunity.numMutual!}
          status={currCommunity.status}
          admin={currCommunity.admin as string}
        />
      );
    }
    // if (joinedCommunities.length === 0 && pendingCommunities.length === 0) {
    //   const noCommunitiesMessage =
    //     requestUserID === 'user'
    //       ? `You aren't a part of any communities yet. Get involved!`
    //       : `${username} isn't a part of any communities yet.`;

    //   return (
    //     <RSText size={20} type="head" className={styles.noCommunities}>
    //       {noCommunitiesMessage}
    //     </RSText>
    //   );
    // }
    return output;
  }

  return (
    <div className={styles.wrapper} style={{ height: height }}>
      <CreateCommunityModal
        open={showCreateCommunitiesModal}
        onClose={() => setShowCreateCommunitiesModal(false)}
        appendCommunity={appendNewCommunity}
      />
      <Box boxShadow={2} borderRadius={8} className={styles.box}>
        <WelcomeMessage
          title={`${
            requestUserID === 'user' ? 'Your' : `${username}\'s`
          } Communities`}
          message={`All of the communities that ${
            requestUserID === 'user' ? 'you belong' : `${username} belongs`
          } to will be displayed on this page.`}
          buttonText={'Create Community'}
          buttonAction={() => setShowCreateCommunitiesModal(true)}
        />
        {renderSearchArea()}
      </Box>
      <RSTabs
        tabs={[
          { label: 'Following', value: 'following'},
          { label: 'Discover', value: 'discover'}
        ]}
        onChange={handleTabChange}
        selected={selectedTab}
        className={styles.tabs}
      />
      <div className={styles.body}>
        {loading ? (
          <CircularProgress className={styles.loadingIndicator} size={100} />
        ) : (
          <div className={styles.singleCommunity}>{communityFeed}</div>
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

export default connect(mapStateToProps, mapDispatchToProps)(YourCommunitiesBody);
