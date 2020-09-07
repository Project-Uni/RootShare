import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { CircularProgress } from '@material-ui/core';

import { connect } from 'react-redux';

import { colors } from '../../../theme/Colors';
import { WelcomeMessage } from '../../reusable-components';
import CommunityOverview from './CommunityOverview';

import PurdueHypeBanner from '../../../images/PurdueHypeAlt.png';
import { makeRequest } from '../../../helpers/functions';

import { CommunityType } from '../../../helpers/types';

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
  singleCommunity: {
    marginLeft: 1,
    marginRight: 1,
    marginBottom: 1,
    borderRadius: 1,
    borderTop: `1px solid ${colors.fourth}`,
  },
  loadingIndicator: {
    marginTop: 80,
    color: colors.primary,
  },
}));

type YourCommunities_Community = {
  _id: string;
  name: string;
  description: string;
  private: boolean;
  type: CommunityType;
  profilePicture?: string;
  numMembers: number;
  numMutual: number;
};

type Props = {
  user: { [key: string]: any };
  accessToken: string;
  refreshToken: string;
};

function YourCommunitiesBody(props: Props) {
  const styles = useStyles();
  const [loading, setLoading] = useState(true);
  const [height, setHeight] = useState(window.innerHeight - HEADER_HEIGHT);
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);

  const [joinedCommunities, setJoinedCommunities] = useState<
    YourCommunities_Community[]
  >([]);
  const [pendingCommunities, setPendingCommunities] = useState<
    YourCommunities_Community[]
  >([]);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    fetchData().then(() => {
      setLoading(false);
    });
  }, []);

  async function fetchData() {
    const { data } = await makeRequest(
      'GET',
      `/api/user/${props.user._id}/communities/all`,
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

  function handleResize() {
    setHeight(window.innerHeight - HEADER_HEIGHT);
  }

  function closeWelcomeMessage() {
    setShowWelcomeModal(false);
  }

  function renderJoinedCommunities() {
    const output = [];
    for (let i = 0; i < joinedCommunities.length; i++) {
      output.push(
        <CommunityOverview
          communityID={joinedCommunities[i]._id}
          name={joinedCommunities[i].name}
          private={joinedCommunities[i].private}
          style={styles.singleCommunity}
          description={joinedCommunities[i].description}
          type={joinedCommunities[i].type}
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
          communityID={pendingCommunities[i]._id}
          name={pendingCommunities[i].name}
          private={pendingCommunities[i].private}
          style={styles.singleCommunity}
          description={pendingCommunities[i].description}
          type={pendingCommunities[i].type}
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
    return (
      <>
        {renderJoinedCommunities()}
        {renderPendingCommunities()}
      </>
    );
  }

  return (
    <div className={styles.wrapper} style={{ height: height }}>
      {showWelcomeModal && (
        <WelcomeMessage
          title="Communities"
          message="All of the communities that you belong to will be displayed on this page. We believe in the power of community and want to make it as easy to access as possible"
          onClose={closeWelcomeMessage}
        />
      )}
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
