import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { CircularProgress } from '@material-ui/core';
import { connect } from 'react-redux';

import { colors } from '../../../theme/Colors';
import RSText from '../../../base-components/RSText';
import { RSTabs, UserPost } from '../../reusable-components';
import CommunityMakePostContainer from './CommunityMakePostContainer';

import {
  PostType,
  AdminCommunityServiceResponse,
  CommunityStatus,
  CommunityPostingOption,
} from '../../../helpers/types';
import {
  makeRequest,
  formatDatePretty,
  formatTime,
} from '../../../helpers/functions';

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
  loadingIndicator: {
    color: colors.primary,
    marginTop: 80,
  },
  errorContainer: {
    marginTop: 30,
  },
  postStyle: {
    margin: 8,
  },
  noPosts: {
    marginTop: 20,
  },
  tabs: {
    marginLeft: 5,
    marginRight: 5,
  },
}));

type CommunityTab =
  | 'external'
  | 'internal'
  | 'internal-alumni'
  | 'internal-current'
  | 'following';

type Props = {
  className?: string;
  communityID: string;
  universityName: string;
  communityProfilePicture?: string;
  name: string;
  status: CommunityStatus;
  isAdmin?: boolean;
  user: { [key: string]: any };
  accessToken: string;
  refreshToken: string;
};

var tabChangeSemaphore = 0;
// Semaphore was added in to fix issue where previous tab
// posts would be loaded into an incorrect tab if the user
// switched tabs before the network request completed.

function CommunityBodyContent(props: Props) {
  const styles = useStyles();

  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<CommunityTab>('external');
  const [postingOptions, setPostingOptions] = useState<CommunityPostingOption[]>([]);
  const [posts, setPosts] = useState<JSX.Element[]>([]);
  const [fetchErr, setFetchErr] = useState(false);

  const tabs = [
    { label: 'External', value: 'external' },
    { label: 'Following', value: 'following' },
  ];

  if (props.isAdmin) {
    tabs.splice(1, 0, { label: 'Internal Current', value: 'internal-current' });
    tabs.splice(2, 0, { label: 'Internal Alumni', value: 'internal-alumni' });
  } else {
    tabs.splice(1, 0, { label: 'Internal', value: 'internal' });
  }

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchData(), updatePostingOptions()]).then(() => {
      setLoading(false);
    });
  }, [selectedTab]);

  useEffect(() => {
    updatePostingOptions();
  }, [selectedTab, props.communityProfilePicture]);

  async function fetchData() {
    setPosts([]);
    const currSemaphoreState = tabChangeSemaphore;
    const routeSuffix = getRouteSuffix();
    const { data } = await makeRequest(
      'GET',
      `/api/posts/community/${props.communityID}/${routeSuffix}`,
      {},
      true,
      props.accessToken,
      props.refreshToken
    );
    if (tabChangeSemaphore === currSemaphoreState) {
      if (data.success === 1) {
        setFetchErr(false);
        setPosts(createFeed(data.content['posts']));
      } else {
        setFetchErr(true);
      }
    }
  }

  async function getAdminCommunities() {
    const { data } = await makeRequest(
      'GET',
      `/api/user/${props.user._id}/communities/admin`,
      {},
      true,
      props.accessToken,
      props.refreshToken
    );

    if (data.success === 1) {
      const communities: AdminCommunityServiceResponse[] = data.content.communities.filter(
        (community: AdminCommunityServiceResponse) => {
          let currFollowing = false;
          for (let i = 0; i < community.followingCommunities.length; i++)
            if (community.followingCommunities[i].to._id === props.communityID) {
              currFollowing = true;
              break;
            }

          return currFollowing;
        }
      );

      return communities;
    } else return [];
  }

  function getRouteSuffix() {
    switch (selectedTab) {
      case 'external':
        return 'external';
      case 'internal':
        return props.user.accountType === 'student'
          ? 'internal/current'
          : 'internal/alumni';
      case 'internal-current':
        return 'internal/current';
      case 'internal-alumni':
        return 'internal/alumni';
      case 'following':
        return 'following';
    }
  }

  async function updatePostingOptions() {
    let newPostingOptions: CommunityPostingOption[] = [];
    if (
      selectedTab === 'internal-current' ||
      (selectedTab === 'internal' && props.user.accountType === 'student')
    )
      newPostingOptions.push({
        description: 'Post',
        routeSuffix: 'internal/current',
        profilePicture: props.user.profilePicture,
      });
    else if (
      selectedTab === 'internal-alumni' ||
      (selectedTab === 'internal' && props.user.accountType === 'alumni')
    )
      newPostingOptions.push({
        description: 'Post',
        routeSuffix: 'internal/alumni',
        profilePicture: props.user.profilePicture,
      });
    else if (selectedTab === 'external') {
      let memberDescription = 'Post';
      if (props.isAdmin) {
        memberDescription = 'Post as yourself';
        newPostingOptions.push({
          description: `Broadcast to ${props.universityName} as ${props.name}`,
          routeSuffix: 'broadcast',
          profilePicture: props.communityProfilePicture,
        });
        newPostingOptions.push({
          description: `Post as ${props.name}`,
          routeSuffix: 'external/admin',
          profilePicture: props.communityProfilePicture,
        });
      }

      const followingCommunities = await getAdminCommunities();

      if (followingCommunities.length > 0) {
        memberDescription = 'Post as yourself';
        followingCommunities.forEach((followingCommunity) => {
          newPostingOptions.push({
            description: `Post as ${followingCommunity.name}`,
            routeSuffix: 'external/following',
            communityID: followingCommunity._id,
            profilePicture: followingCommunity.profilePicture,
          });
        });
      }

      if (props.status === 'JOINED')
        newPostingOptions.unshift({
          description: memberDescription,
          routeSuffix: 'external/member',
          profilePicture: props.user.profilePicture,
        });
    }

    setPostingOptions(newPostingOptions);
  }

  function handleTabChange(newTab: CommunityTab) {
    if (newTab !== selectedTab) {
      tabChangeSemaphore++;
      setSelectedTab(newTab);
    }
  }

  function createFeed(posts: PostType[]) {
    const output = [];
    for (let i = 0; i < posts.length; i++) {
      const currPost = posts[i];
      const { anonymous } = currPost;
      output.push(
        <UserPost
          posterID={
            currPost.anonymous ? currPost.fromCommunity._id : currPost.user._id
          }
          name={
            anonymous
              ? `${currPost.fromCommunity.name}`
              : `${currPost.user.firstName} ${currPost.user.lastName}`
          }
          timestamp={`${formatDatePretty(
            new Date(currPost.createdAt)
          )} at ${formatTime(new Date(currPost.createdAt))}`}
          profilePicture={
            anonymous
              ? currPost.fromCommunity.profilePicture
              : currPost.user.profilePicture
          }
          type={currPost.type}
          message={currPost.message}
          likeCount={currPost.likes}
          commentCount={0}
          style={styles.postStyle}
          key={currPost._id}
          anonymous={anonymous}
          toCommunity={
            selectedTab === 'following' ? currPost.toCommunity.name : undefined
          }
          toCommunityID={
            selectedTab === 'following' ? currPost.toCommunity._id : undefined
          }
        />
      );
    }
    return output;
  }

  function appendPost(newPostInfo: any, profilePicture: string | undefined) {
    setPosts((prevPosts) => {
      const { anonymous } = newPostInfo;
      const newPost = (
        <UserPost
          posterID={anonymous ? newPostInfo.fromCommunity._id : newPostInfo.user._id}
          name={
            anonymous
              ? `${newPostInfo.fromCommunity.name}`
              : `${newPostInfo.user.firstName} ${newPostInfo.user.lastName}`
          }
          timestamp={`${formatDatePretty(
            new Date(newPostInfo.createdAt)
          )} at ${formatTime(new Date(newPostInfo.createdAt))}`}
          profilePicture={profilePicture}
          message={newPostInfo.message}
          type={newPostInfo.type}
          likeCount={0}
          commentCount={0}
          style={styles.postStyle}
          key={newPostInfo._id}
          anonymous={anonymous}
        />
      );

      return [newPost].concat(prevPosts);
    });
  }

  function renderBody() {
    return (
      <div>
        {postingOptions.length > 0 && (
          <CommunityMakePostContainer
            communityID={props.communityID}
            communityName={props.name}
            postingOptions={postingOptions}
            appendNewPost={appendPost}
          />
        )}
        {posts.length > 0 ? posts : renderNoPosts()}
      </div>
    );
  }

  function renderError() {
    return (
      <div className={styles.errorContainer}>
        <RSText size={16} bold type="head">
          There was an error fetching the posts.
        </RSText>
      </div>
    );
  }

  function renderNoPosts() {
    return (
      <RSText size={16} type="head" className={styles.noPosts}>
        There are no posts yet.
      </RSText>
    );
  }

  return (
    <div
      className={[styles.wrapper, props.className].join(' ')}
      style={{
        background: loading || posts.length === 0 ? 'inherit' : colors.background,
      }}
    >
      <RSTabs
        tabs={tabs}
        selected={selectedTab}
        onChange={handleTabChange}
        className={styles.tabs}
      />
      {loading ? (
        <CircularProgress size={100} className={styles.loadingIndicator} />
      ) : fetchErr ? (
        renderError()
      ) : (
        renderBody()
      )}
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

export default connect(mapStateToProps, mapDispatchToProps)(CommunityBodyContent);
