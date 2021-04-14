import React, { useState, useEffect, useCallback } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useParams } from 'react-router-dom';

import { useSelector, useDispatch } from 'react-redux';
import { updateSidebarComponents } from '../../../redux/actions';
import { RootshareReduxState } from '../../../redux/store/stateManagement';

import { CircularProgress, Box } from '@material-ui/core';

import { WelcomeMessage } from '../../reusable-components';
import CommunityHighlight from '../../reusable-components/components/CommunityHighlight';
import CreateCommunityModal from './CreateCommunityModal';
import { RSText } from '../../../base-components';

import { makeRequest } from '../../../helpers/functions';
import { Community } from '../../../helpers/types';
import Theme from '../../../theme/Theme';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    height: '100%',
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
    color: Theme.bright,
  },
  box: {
    background: Theme.white,
    margin: 8,
  },
}));

type Props = {};

export default function YourCommunitiesBody(props: Props) {
  const styles = useStyles();
  const dispatch = useDispatch();

  const { _id: userID } = useSelector((state: RootshareReduxState) => state.user);

  const [loading, setLoading] = useState(true);

  const [username, setUsername] = useState('User');

  const [joinedCommunities, setJoinedCommunities] = useState<Community[]>([]);
  const [pendingCommunities, setPendingCommunities] = useState<Community[]>([]);

  const [showCreateCommunitiesModal, setShowCreateCommunitiesModal] = useState(
    false
  );

  const { userID: requestUserID } = useParams<{ userID: string }>();

  useEffect(() => {
    dispatch(
      updateSidebarComponents({
        names: ['discoverCommunities', 'discoverUsers'],
      })
    );
  }, []);

  const fetchData = useCallback(async () => {
    const { data } = await makeRequest(
      'GET',
      `/api/user/${
        requestUserID === 'user' ? userID : requestUserID
      }/communities/all`
    );
    if (data.success === 1) {
      setJoinedCommunities(data.content['joinedCommunities']);
      setPendingCommunities(data.content['pendingCommunities']);
    }
  }, [requestUserID]);

  useEffect(() => {
    if (!loading) setLoading(true);

    if (requestUserID !== 'user') fetchUserBasicInfo();
    fetchData().then(() => {
      setLoading(false);
    });
  }, [fetchData]);

  async function fetchUserBasicInfo() {
    const { data } = await makeRequest('GET', `/api/user/${requestUserID}/basic`);
    if (data.success === 1) {
      setUsername(`${data.content.user?.firstName}`);
    }
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
          userID={userID}
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
    for (let i = 0; i < pendingCommunities.length; i++) {
      const currCommunity = pendingCommunities[i];
      output.push(
        <CommunityHighlight
          userID={userID}
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
        requestUserID === 'user'
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
    <div className={styles.wrapper}>
      <CreateCommunityModal
        open={showCreateCommunitiesModal}
        onClose={() => setShowCreateCommunitiesModal(false)}
        appendCommunity={appendNewCommunity}
      />
      <Box boxShadow={2} borderRadius={8} className={styles.box}>
        <WelcomeMessage
          counter={joinedCommunities.length}
          title={`${
            requestUserID === 'user' ? 'Your' : `${username}\'s`
          } Communities`}
          message={`All of the communities that ${
            requestUserID === 'user' ? 'you belong' : `${username} belongs`
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
