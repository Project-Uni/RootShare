import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';

import { makeRequest } from '../../../../helpers/functions';
import { colors } from '../../../../theme/Colors';
import { HEADER_HEIGHT } from '../../../../helpers/constants';

import SingleFollowCommunity from './SingleFollowCommunity';
import RSText from '../../../../base-components/RSText';

const VERTICAL_PADDING_TOTAL = 40;

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    width: 270,
    background: colors.second,
    textAlign: 'left',
    padding: 20,
    overflow: 'scroll',
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
  accessToken: string;
  refreshToken: string;
  communityID: string;
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

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    fetchData();
  }, []);

  function handleResize() {
    setHeight(window.innerHeight - HEADER_HEIGHT - VERTICAL_PADDING_TOTAL);
  }

  function fetchData() {
    //Retrieve following communities
    makeRequest(
      'GET',
      `/api/community/${props.communityID}/following`,
      {},
      true,
      props.accessToken,
      props.refreshToken
    ).then(({ data }) => {
      if (data['success'] === 1) {
        const { communities: communitiesFollowing } = data.content;
        setFollowingCommunities(communitiesFollowing);
      }
    });
    //Retrieve followed by communities
    makeRequest(
      'GET',
      `/api/community/${props.communityID}/followedBy`,
      {},
      true,
      props.accessToken,
      props.refreshToken
    ).then(({ data }) => {
      if (data['success'] === 1) {
        const { communities: communitiesFollowedBy } = data.content;
        setFollowedByCommunities(communitiesFollowedBy);
      }
    });
  }

  function renderFollowingCommunities() {
    const communitiesFollowing: any = [];
    if (followingCommunities.length === 0) return;

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
          isLast={i === followingCommunities.length -1 }
          accessToken={props.accessToken}
          refreshToken={props.refreshToken}
          members={followingCommunities[i].members.length}
        />
      );
      return (
        <div>
          <RSText
            size={18}
            type="head"
            bold
            color={colors.primaryText}
            className={styles.communityText}
          >
            Following
          </RSText>
          {communitiesFollowing}
        </div>
      );
    }
  }

  function renderFollowedByCommunities() {
    const communitiesFollowedBy: any = [];
    if (followedByCommunities.length === 0) return;

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
          accessToken={props.accessToken}
          refreshToken={props.refreshToken}
          members={followedByCommunities[i].members.length}
        />
      );
    }
    return (
      <div>
        <RSText
          size={18}
          type="head"
          bold
          color={colors.primaryText}
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

const mapStateToProps = (state: { [key: string]: any }) => {
  return {
    accessToken: state.accessToken,
    refreshToken: state.refreshToken,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(FollowedByCommunities);