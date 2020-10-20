import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { CircularProgress, Box } from '@material-ui/core';

import { connect } from 'react-redux';

import { colors } from '../../../theme/Colors';
import { WelcomeMessage } from '../../reusable-components';
import CommunityOverview from './CommunityOverview';
import { RSText } from '../../../base-components';

import { makeRequest } from '../../../helpers/functions';
import { CommunityType } from '../../../helpers/types';
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

type YourCommunities_Community = {
  _id: string;
  name: string;
  description: string;
  private: boolean;
  type: CommunityType;
  admin: string;
  profilePicture?: string;
  numMembers: number;
  numMutual: number;
};

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
  const [joinedCommunities, setJoinedCommunities] = useState<
    YourCommunities_Community[]
  >([]);
  const [pendingCommunities, setPendingCommunities] = useState<
    YourCommunities_Community[]
  >([]);

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
      output.push(
        <CommunityOverview
          userID={props.user._id}
          communityID={joinedCommunities[i]._id}
          name={joinedCommunities[i].name}
          private={joinedCommunities[i].private}
          style={styles.singleCommunity}
          description={joinedCommunities[i].description}
          type={joinedCommunities[i].type}
          admin={joinedCommunities[i].admin}
          memberCount={joinedCommunities[i].numMembers}
          mutualMemberCount={joinedCommunities[i].numMutual}
          profilePicture={joinedCommunities[i].profilePicture}
          status="joined"
        />
      );
    }
    return output;
  }

  function renderPendingCommunities() {
    const output = [];
    for (let i = 0; i < pendingCommunities.length; i++) {
      output.push(
        <CommunityOverview
          userID={props.user._id}
          communityID={pendingCommunities[i]._id}
          name={pendingCommunities[i].name}
          private={pendingCommunities[i].private}
          style={styles.singleCommunity}
          description={pendingCommunities[i].description}
          type={pendingCommunities[i].type}
          admin={pendingCommunities[i].admin}
          memberCount={pendingCommunities[i].numMembers}
          mutualMemberCount={pendingCommunities[i].numMutual}
          profilePicture={pendingCommunities[i].profilePicture}
          status="pending"
        />
      );
    }
    return output;
  }

  function renderCommunities() {
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

    return (
      <>
        {renderPendingCommunities()}
        {renderJoinedCommunities()}
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
