import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { CircularProgress, Box } from '@material-ui/core';

import { connect } from 'react-redux';

import { colors } from '../../../theme/Colors';
import { WelcomeMessage } from '../../reusable-components';
import CommunityOverview from './CommunityOverview';
import CommunityHighlight from '../../reusable-components/components/CommunityHighlight';

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
  const [joinedCommunities, setJoinedCommunities] = useState<Community[]>([]);
  const [pendingCommunities, setPendingCommunities] = useState<Community[]>([]);

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

  function renderJoinedCommunities() {
    const output = [];
    for (let i = 0; i < joinedCommunities.length; i++) {
      // output.push(
      //   <CommunityHighlight
      //     userID={props.user._id}
      //     style={styles.singleCommunity}
      //     communityID={joinedCommunities[i]._id}
      //     private={joinedCommunities[i].private}
      //     name={joinedCommunities[i].name}
      //     type={joinedCommunities[i].type}
      //     description={joinedCommunities[i].description}
      //     profilePicture={joinedCommunities[i].profilePicture}
      //     memberCount={joinedCommunities[i].numMembers!}
      //     mutualMemberCount={joinedCommunities[i].numMutual!}
      //     status={joinedCommunities[i].status}
      //     admin={joinedCommunities[i].admin as string}
      //     // setNotification={setNotification}
      //   />
      // );

      output.push(
        <CommunityOverview
          userID={props.user._id}
          style={styles.singleCommunity}
          communityID={joinedCommunities[i]._id}
          private={joinedCommunities[i].private}
          name={joinedCommunities[i].name}
          type={joinedCommunities[i].type}
          description={joinedCommunities[i].description}
          profilePicture={joinedCommunities[i].profilePicture}
          memberCount={joinedCommunities[i].numMembers!}
          mutualMemberCount={joinedCommunities[i].numMutual!}
          status={joinedCommunities[i].status}
          admin={joinedCommunities[i].admin as string}
          // setNotification={setNotification}

          accessToken={props.accessToken}
          refreshToken={props.refreshToken}
        />
      );
    }
    return output;
  }

  function renderPendingCommunities() {
    const output = [];
    for (let i = 0; i < pendingCommunities.length; i++) {
      // output.push(
      //   <CommunityHighlight
      //     userID={props.user._id}
      //     communityID={pendingCommunities[i]._id}
      //     name={pendingCommunities[i].name}
      //     private={pendingCommunities[i].private}
      //     style={styles.singleCommunity}
      //     description={pendingCommunities[i].description}
      //     type={pendingCommunities[i].type}
      //     admin={pendingCommunities[i].admin as string}
      //     memberCount={pendingCommunities[i].numMembers!}
      //     mutualMemberCount={pendingCommunities[i].numMutual!}
      //     profilePicture={pendingCommunities[i].profilePicture}
      //     status={pendingCommunities[i].status}
      //     // setNotification={setNotification}
      //   />
      // );

      output.push(
        <CommunityOverview
          userID={props.user._id}
          communityID={pendingCommunities[i]._id}
          name={pendingCommunities[i].name}
          private={pendingCommunities[i].private}
          style={styles.singleCommunity}
          description={pendingCommunities[i].description}
          type={pendingCommunities[i].type}
          admin={pendingCommunities[i].admin as string}
          memberCount={pendingCommunities[i].numMembers!}
          mutualMemberCount={pendingCommunities[i].numMutual!}
          profilePicture={pendingCommunities[i].profilePicture}
          status={pendingCommunities[i].status}
          // setNotification={setNotification}

          accessToken={props.accessToken}
          refreshToken={props.refreshToken}
        />
      );
    }
    return output;
  }

  function renderCommunities() {
    return (
      <>
        {renderJoinedCommunities()}
        {renderPendingCommunities()}
      </>
    );
  }

  return (
    <div className={styles.wrapper} style={{ height: height }}>
      <Box boxShadow={2} borderRadius={8} className={styles.box}>
        <WelcomeMessage
          title={`${
            props.requestUserID === 'user' ? 'Your' : `${username}\'s`
          } Communities`}
          message={`All of the communities that ${
            props.requestUserID === 'user' ? 'you belong' : `${username} belongs`
          } to will be displayed on this page.`}
        />
      </Box>
      <div className={styles.body}>
        {loading ? (
          <CircularProgress className={styles.loadingIndicator} size={100} />
        ) : (
          renderCommunities()
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
