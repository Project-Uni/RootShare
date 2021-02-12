import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { makeRequest } from '../../../../helpers/functions';
import theme from '../../../../theme/Theme';
import { HEADER_HEIGHT } from '../../../../helpers/constants';

import SingleFollowCommunity from './SingleFollowCommunity';
import RSText from '../../../../base-components/RSText';

const VERTICAL_PADDING_TOTAL = 40;

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    width: 270,
    background: theme.background,
    textAlign: 'left',
    padding: 20,
    overflow: 'scroll',
  },
  followsWrapper: {
    marginBottom: 50,
  },
  peopleText: {
    textAlign: 'center',
  },
  communityText: {
    textAlign: 'center',
    paddingTop: 10,
  },
}));

type Props = {
  match: {
    params: { [key: string]: any };
    [key: string]: any;
  };
};

type FollowCommunity = {
  description: string;
  name: string;
  profilePicture: string;
  type: string;
  _id: string;
  members: string[];
};

function FollowedByCommunities(props: Props) {
  const styles = useStyles();

  const [height, setHeight] = useState(
    window.innerHeight - HEADER_HEIGHT - VERTICAL_PADDING_TOTAL
  );

  const [followingCommunities, setFollowingCommunities] = useState<
    FollowCommunity[]
  >([]);
  const [followedByCommunities, setFollowedByCommunities] = useState<
    FollowCommunity[]
  >([]);

  const communityID = props.match.params['orgID'];

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    fetchData();
  }, []);

  function handleResize() {
    setHeight(window.innerHeight - HEADER_HEIGHT - VERTICAL_PADDING_TOTAL);
  }

  function fetchData() {
    //Retrieve following communities
    makeRequest('GET', `/api/community/${communityID}/following`).then(
      ({ data }) => {
        if (data['success'] === 1) {
          const { communities: communitiesFollowing } = data.content;
          setFollowingCommunities(communitiesFollowing);
        }
      }
    );
    //Retrieve followed by communities
    makeRequest('GET', `/api/community/${communityID}/followedBy`).then(
      ({ data }) => {
        if (data['success'] === 1) {
          const { communities: communitiesFollowedBy } = data.content;
          setFollowedByCommunities(communitiesFollowedBy);
        }
      }
    );
  }

  function renderFollowingCommunities() {
    const communitiesFollowing: any = [];

    for (let i = 0; i < followingCommunities.length; i++) {
      const currSuggestion = followingCommunities[i];
      communitiesFollowing.push(
        <SingleFollowCommunity
          key={currSuggestion._id}
          _id={currSuggestion._id}
          name={currSuggestion.name}
          type={currSuggestion.type}
          description={currSuggestion.description}
          profilePicture={currSuggestion.profilePicture}
          isLast={i === followingCommunities.length - 1}
          members={followingCommunities[i].members.length}
        />
      );
    }

    if (communitiesFollowing.length === 0)
      communitiesFollowing.push(
        <RSText
          size={14}
          type="body"
          bold
          color={theme.secondaryText}
          className={styles.communityText}
        >
          Not following any communities yet
        </RSText>
      );

    return (
      <div className={styles.followsWrapper}>
        <RSText
          size={18}
          type="head"
          bold
          color={theme.primaryText}
          className={styles.communityText}
        >
          Following
        </RSText>
        {communitiesFollowing}
      </div>
    );
  }

  function renderFollowedByCommunities() {
    const communitiesFollowedBy: any = [];

    for (let i = 0; i < followedByCommunities.length; i++) {
      const currSuggestion = followedByCommunities[i];
      communitiesFollowedBy.push(
        <SingleFollowCommunity
          key={currSuggestion._id}
          _id={currSuggestion._id}
          name={currSuggestion.name}
          type={currSuggestion.type}
          description={currSuggestion.description}
          profilePicture={currSuggestion.profilePicture}
          isLast={i === followedByCommunities.length - 1}
          members={followedByCommunities[i].members.length}
        />
      );
    }

    if (communitiesFollowedBy.length === 0)
      communitiesFollowedBy.push(
        <RSText
          size={14}
          type="body"
          bold
          color={theme.secondaryText}
          className={styles.communityText}
        >
          Not followed by any communities yet
        </RSText>
      );

    return (
      <div className={styles.followsWrapper}>
        <RSText
          size={18}
          type="head"
          bold
          color={theme.primaryText}
          className={styles.communityText}
        >
          Followed By
        </RSText>
        {communitiesFollowedBy}
      </div>
    );
  }

  return (
    <div className={styles.wrapper} style={{ height: height }}>
      {renderFollowingCommunities()}
      {renderFollowedByCommunities()}
    </div>
  );
}

export default FollowedByCommunities;
