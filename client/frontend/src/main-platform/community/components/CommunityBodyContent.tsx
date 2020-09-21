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
    borderBottom: `1px solid ${colors.fourth}`,
  },
  noPosts: {
    marginTop: 20,
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

function CommunityBodyContent(props: Props) {
  const styles = useStyles();

  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('external');
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
    fetchData().then(() => {
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchData().then(() => {
      setLoading(false);
    });
  }, [selectedTab]);

  async function fetchData() {
    setPosts([]);
    const routeSuffix = getRouteSuffix();
    const { data } = await makeRequest(
      'GET',
      `/api/posts/community/${props.communityID}/${routeSuffix}`,
      {},
      true,
      props.accessToken,
      props.refreshToken
    );
    if (data.success === 1) {
      setFetchErr(false);
      setPosts(createFeed(data.content['posts']));
    } else {
      setFetchErr(true);
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
        return 'following'; //TODO - Create functionality for this route
    }
  }

  function handleTabChange(newTab: string) {
    if (newTab !== selectedTab) setSelectedTab(newTab);
  }

  function createFeed(posts: PostType[]) {
    const output = [];
    for (let i = 0; i < posts.length; i++) {
      if (posts[i].anonymous) {
        output.push(
          <UserPost
            _id={posts[i].fromCommunity._id}
            name={`${posts[i].fromCommunity.name}`}
            timestamp={`${formatDatePretty(
              new Date(posts[i].createdAt)
            )} at ${formatTime(new Date(posts[i].createdAt))}`}
            profilePicture={posts[i].fromCommunity.profilePicture}
            message={posts[i].message}
            likeCount={posts[i].likes}
            commentCount={0}
            key={posts[i]._id}
            anonymous
            style={styles.postStyle}
          />
        );
      } else {
        output.push(
          <UserPost
            _id={posts[i].user._id}
            name={`${posts[i].user.firstName} ${posts[i].user.lastName}`}
            timestamp={`${formatDatePretty(
              new Date(posts[i].createdAt)
            )} at ${formatTime(new Date(posts[i].createdAt))}`}
            profilePicture={posts[i].user.profilePicture}
            message={posts[i].message}
            likeCount={posts[i].likes}
            commentCount={0}
            key={posts[i]._id}
            style={styles.postStyle}
          />
        );
      }
    }
    if (output.length === 0)
      output.push(
        <RSText size={16} type="head" className={styles.noPosts}>
          There are no posts yet.
        </RSText>
      );
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
        <p>External posts</p>
        {posts}
      </div>
    );
  }

  function renderInternal() {
    return (
      <div>
        <p>Internal posts</p>
        {posts}
      </div>
    );
  }

  function renderFollowing() {
    return <div>{posts}</div>;
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

  return (
    <div className={[styles.wrapper, props.className].join(' ')}>
      <RSTabs tabs={tabs} selected={selectedTab} onChange={handleTabChange} />
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
