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

type PostingOption = {
  description: string;
  routeSuffix: string;
  communityID?: string;
};

type Props = {
  className?: string;
  communityID: string;
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
  const [postingOption, setPostingOptions] = useState<PostingOption[]>([]);
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
    fetchData().then(() => {
      setLoading(false);
    });
  }, [selectedTab]);

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

    setPostingOptions(await getPostingOptions());
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

  async function getPostingOptions() {
    let postingOptions: PostingOption[] = [];
    if (
      selectedTab === 'internal-current' ||
      (selectedTab === 'internal' && props.user.accountType === 'student')
    )
      postingOptions.push({
        description: 'Post',
        routeSuffix: 'internal/current',
      });
    else if (
      selectedTab === 'internal-alumni' ||
      (selectedTab === 'internal' && props.user.accountType === 'alumni')
    )
      postingOptions.push({
        description: 'Post',
        routeSuffix: 'internal/alumni',
      });
    else if (selectedTab === 'external') {
      let memberDescription = 'Post';
      if (props.isAdmin) {
        memberDescription = 'Post as yourself';
        postingOptions.push({
          description: `Post as ${props.name}`,
          routeSuffix: 'external/admin',
        });
      }

      const followingCommunities = await getAdminCommunities();

      if (followingCommunities.length > 0) {
        memberDescription = 'Post as yourself';
        followingCommunities.forEach((followingCommunity) => {
          postingOptions.push({
            description: `Post as ${followingCommunity.name}`,
            routeSuffix: 'external/following',
            communityID: followingCommunity._id,
          });
        });
      }

      if (props.status === 'JOINED')
        postingOptions.unshift({
          description: memberDescription,
          routeSuffix: 'external/member',
        });
    }

    console.log(postingOptions);
    return postingOptions;
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
      const { anonymous } = posts[i];
      output.push(
        <UserPost
          _id={anonymous ? posts[i].fromCommunity._id : posts[i].user._id}
          name={
            anonymous
              ? `${posts[i].fromCommunity.name}`
              : `${posts[i].user.firstName} ${posts[i].user.lastName}`
          }
          timestamp={`${formatDatePretty(
            new Date(posts[i].createdAt)
          )} at ${formatTime(new Date(posts[i].createdAt))}`}
          profilePicture={
            anonymous
              ? posts[i].fromCommunity.profilePicture
              : posts[i].user.profilePicture
          }
          message={posts[i].message}
          likeCount={posts[i].likes}
          commentCount={0}
          style={styles.postStyle}
          key={posts[i]._id}
          anonymous={anonymous}
          toCommunity={
            selectedTab === 'following' ? posts[i].toCommunity.name : undefined
          }
          toCommunityID={
            selectedTab === 'following' ? posts[i].toCommunity._id : undefined
          }
        />
      );
    }
    return output;
  }

  function renderBody() {
    switch (selectedTab) {
      case 'external':
        return renderExternal();
      case 'internal':
        return renderInternal();
      case 'internal-current':
        return renderInternal();
      case 'internal-alumni':
        return renderInternal();
      case 'following':
        return renderFollowing();
      default:
        return renderError();
    }
  }

  function renderExternal() {
    return (
      <div>
        <CommunityMakePostContainer postingOptions={[]} appendNewPost={() => {}} />
        {posts.length > 0 ? posts : renderNoPosts()}
      </div>
    );
  }

  function renderInternal() {
    return (
      <div>
        <CommunityMakePostContainer postingOptions={[]} appendNewPost={() => {}} />
        {posts.length > 0 ? posts : renderNoPosts()}
      </div>
    );
  }

  function renderFollowing() {
    return <div>{posts.length > 0 ? posts : renderNoPosts()}</div>;
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
