import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { CircularProgress, Box } from '@material-ui/core';

import { connect } from 'react-redux';

import { colors } from '../../../theme/Colors';
import { WelcomeMessage } from '../../reusable-components';
import CommunityHighlight from '../../reusable-components/components/CommunityHighlight';
import CreateCommunityModal from './CreateCommunityModal';
import { RSText } from '../../../base-components';

import { makeRequest } from '../../../helpers/functions';
import { Community } from '../../../helpers/types';
import { HEADER_HEIGHT } from '../../../helpers/constants';
import { join } from 'path';

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
  noCommunities: {
    marginTop: 30,
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

  const [joinedCommunities, setJoinedCommunities] = useState<Community[]>([]);
  const [pendingCommunities, setPendingCommunities] = useState<Community[]>([]);

  const [numCommunities, setNumCommunities] = useState(null);

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
      setJoinedCommunities(data.content['joinedCommunities']);
      setPendingCommunities(data.content['pendingCommunities']);
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
    setJoinedCommunities([community, ...joinedCommunities]);
  }

  function renderCommunities() {
    const output = [];
    //Joined Communities
    for (let i = 0; i < joinedCommunities.length; i++) {
      const currCommunity = joinedCommunities[i];
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

    if (joinedCommunities.length > numCommunities) {
      if (joinedCommunities.length > 0) {
      setNumCommunities(joinedCommunities.length);
      }
      else {
        setNumCommunities(null);
      }
    }

    //Pending Communities
    for (let i = 0; i < pendingCommunities.length; i++) {
      const currCommunity = pendingCommunities[i];
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
    if (joinedCommunities.length === 0 && pendingCommunities.length === 0) {
      const noCommunitiesMessage =
        props.requestUserID === 'user'
          ? `You aren't a part of any communities yet. Get involved!`
          : `${username} isn't a part of any communities yet.`;

      return (
        <RSText size={20} type="head" className={styles.noCommunities}>
          {noCommunitiesMessage}
        </RSText>
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
          counter={`${numCommunities === null ? ' ' : `${numCommunities}`}`}
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
          <>{renderCommunities()}</>
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
