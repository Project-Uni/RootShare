import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { CircularProgress, Box } from '@material-ui/core';

import { connect } from 'react-redux';

import { colors } from '../../../theme/Colors';
import { WelcomeMessage } from '../../reusable-components';
import CommunityHighlight from '../../reusable-components/components/CommunityHighlight';
import CreateCommunityModal from './CreateCommunityModal';

import { makeRequest } from '../../../helpers/functions';
import { Community } from '../../../helpers/types';
import { HEADER_HEIGHT } from '../../../helpers/constants';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    flex: 1,
    background: colors.background,
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
  singleCommunity: {
    margin: 8,
  },
  loadingIndicator: {
    marginTop: 80,
    color: colors.primary,
  },
  box: {
    background: colors.primaryText,
    margin: 8,
  },
}));

type Props = {
  requestUserID: string;
  user: { [key: string]: any };
  accessToken: string;
  refreshToken: string;
};

function YourCommunitiesBody(props: Props) {
  const styles = useStyles();
  const [loading, setLoading] = useState(true);
  const [height, setHeight] = useState(window.innerHeight - HEADER_HEIGHT);

  const [username, setUsername] = useState('User');

  const [joinedCommunities, setJoinedCommunities] = useState<JSX.Element[]>([]);
  const [pendingCommunities, setPendingCommunities] = useState<JSX.Element[]>([]);

  const [showCreateCommunitiesModal, setShowCreateCommunitiesModal] = useState(
    false
  );

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
      }/communities/all`,
      {},
      true,
      props.accessToken,
      props.refreshToken
    );
    if (data.success === 1) {
      setJoinedCommunities(generateCommunities(data.content['joinedCommunities']));
      setPendingCommunities(generateCommunities(data.content['pendingCommunities']));
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

  function appendNewCommunity(community: Community) {
    const newCommunity = (
      <CommunityHighlight
        userID={props.user._id}
        style={styles.singleCommunity}
        communityID={community._id}
        private={community.private}
        name={community.name}
        type={community.type}
        description={community.description}
        profilePicture={community.profilePicture}
        memberCount={community.numMembers!}
        mutualMemberCount={community.numMutual!}
        status={community.status}
        admin={props.user._id}
      />
    );
    setJoinedCommunities([newCommunity, ...joinedCommunities]);
  }

  function generateCommunities(communities: Community[]) {
    const output = [];
    for (let i = 0; i < communities.length; i++) {
      output.push(
        <CommunityHighlight
          userID={props.user._id}
          style={styles.singleCommunity}
          communityID={communities[i]._id}
          private={communities[i].private}
          name={communities[i].name}
          type={communities[i].type}
          description={communities[i].description}
          profilePicture={communities[i].profilePicture}
          memberCount={communities[i].numMembers!}
          mutualMemberCount={communities[i].numMutual!}
          status={communities[i].status}
          admin={communities[i].admin as string}
        />
      );
    }
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
            props.requestUserID === 'user' ? 'Your' : `${username}\'s`
          } Communities`}
          message={`All of the communities that ${
            props.requestUserID === 'user' ? 'you belong' : `${username} belongs`
          } to will be displayed on this page.`}
          buttonText={'Create Community'}
          buttonAction={() => setShowCreateCommunitiesModal(true)}
        />
      </Box>
      <div className={styles.body}>
        {loading ? (
          <CircularProgress className={styles.loadingIndicator} size={100} />
        ) : (
          <>
            {joinedCommunities}
            {pendingCommunities}
          </>
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
