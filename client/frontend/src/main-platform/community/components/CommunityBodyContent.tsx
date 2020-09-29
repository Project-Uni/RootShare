import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { CircularProgress } from '@material-ui/core';

import { connect } from 'react-redux';
import { PostType } from '../../../helpers/types';

import {
  makeRequest,
  formatDatePretty,
  formatTime,
} from '../../../helpers/functions';

import { colors } from '../../../theme/Colors';
import RSText from '../../../base-components/RSText';
import { RSTabs, UserPost } from '../../reusable-components';
import CommunityMakePostContainer from './CommunityMakePostContainer';
import CommunityMembers from './CommunityMembers';

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

type Props = {
  className?: string;
  communityID: string;
  isAdmin?: boolean;
  user: { [key: string]: any };
  accessToken: string;
  refreshToken: string;
};

type CommunityTab =
  | 'external'
  | 'internal'
  | 'internal-alumni'
  | 'internal-current'
  | 'following'
  | 'members';

var tabChangeSemaphore = 0;
// Semaphore was added in to fix issue where previous tab
// posts would be loaded into an incorrect tab if the user
// switched tabs before the network request completed.

function CommunityBodyContent(props: Props) {
  const styles = useStyles();

  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<CommunityTab>('external');
  const [posts, setPosts] = useState<JSX.Element[]>([]);
  const [fetchErr, setFetchErr] = useState(false);

  const tabs = [
    { label: 'External', value: 'external' },
    { label: 'Following', value: 'following' },
    { label: 'Members', value: 'members' },
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
    if (selectedTab !== 'members') {
      await fetchPosts();
    } else {
      await fetchMembers();
    }
  }

  async function fetchPosts() {
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

  async function fetchMembers() {
    const currSemaphoreState = tabChangeSemaphore;
    const { data } = await makeRequest(
      'GET',
      `/api/community/${props.communityID}/members`,
      {},
      true,
      props.accessToken,
      props.refreshToken
    );
    if (tabChangeSemaphore === currSemaphoreState) {
      if (data.success === 1) {
        setFetchErr(false);
        // setPosts(createFeed(data.content['posts']));
        console.log('Retrieved members');
      } else {
        setFetchErr(true);
      }
    }
  }

  function getRouteSuffix() {
    switch (selectedTab) {
      case 'external':
        return 'external';
      case 'internal':
        if (props.user.accountType === 'student') return 'internal/current';
        return 'internal/alumni';
      case 'internal-current':
        return 'internal/current';
      case 'internal-alumni':
        return 'internal/alumni';
      case 'following':
        return 'following';
    }
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
      case 'members':
        return <CommunityMembers />;
      default:
        return renderError();
    }
  }

  function renderExternal() {
    return (
      <div>
        <CommunityMakePostContainer />
        {posts.length > 0 ? posts : renderNoPosts()}
      </div>
    );
  }

  function renderInternal() {
    return (
      <div>
        <CommunityMakePostContainer />
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
