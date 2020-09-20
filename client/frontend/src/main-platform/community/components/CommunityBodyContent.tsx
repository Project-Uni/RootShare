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
}));

type Props = {
  className?: string;
  communityID: string;
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
    { label: 'Internal', value: 'internal' },
    { label: 'Following', value: 'following' },
  ];

  useEffect(() => {
    fetchData().then(() => {
      setLoading(false);
    });
  }, []);

  async function fetchData() {
    const { data } = await makeRequest(
      'GET',
      `/api/posts/community/${props.communityID}/external`,
      {},
      true,
      props.accessToken,
      props.refreshToken
    );
    if (data.success === 1) {
      setPosts(createFeed(data.content['posts']));
    } else {
      setFetchErr(true);
    }
  }

  function handleTabChange(newTab: string) {
    if (newTab !== selectedTab) setSelectedTab(newTab);
  }

  // function generatePosts(data: PostType[]) {
  //   const output:  = [];
  //   return output;
  // }
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
    return output;
  }

  function renderBody() {
    switch (selectedTab) {
      case 'external':
        return renderExternal();
      case 'internal':
        return renderInternal();
      case 'following':
        return renderFollowing();
      default:
        return <p>There was an error</p>;
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
    return <div>Internal</div>;
  }

  function renderFollowing() {
    return <div>Following</div>;
  }

  function renderError() {
    return (
      <div className={styles.errorContainer}>
        <RSText size={16} bold>
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
