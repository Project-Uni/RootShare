import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { CircularProgress, Box } from '@material-ui/core';

import { connect } from 'react-redux';

import { colors } from '../../../theme/Colors';
import RSText from '../../../base-components/RSText';

import { WelcomeMessage, UserPost, RSTabs } from '../../reusable-components';
import MakePostContainer from './MakePostContainer';

import {
  makeRequest,
  formatDatePretty,
  formatTime,
} from '../../../helpers/functions';
import { PostType } from '../../../helpers/types';
import { HEADER_HEIGHT } from '../../../helpers/constants';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    flex: 1,
    background: 'rgb(227, 227, 227)',
    overflow: 'scroll',
    minWidth: 600,
  },
  loadingIndicator: {
    color: colors.primary,
    marginTop: 80,
  },
  posts: {
    marginLeft: 1,
    marginRight: 1,
  },
  singlePost: {
    marginTop: 1,
    borderRadius: 1,
  },
  postBox: {
    margin: 8,
  },
  tabs: {
    marginLeft: 5,
    marginRight: 5,
    marginBottom: 5,
  },
  box: {
    background: colors.primaryText,
    margin: 8,
  },
}));

type Props = {
  user: { [key: string]: any };
  accessToken: string;
  refreshToken: string;
};

function HomepageBody(props: Props) {
  const styles = useStyles();

  const [loading, setLoading] = useState(true);
  const [height, setHeight] = useState(window.innerHeight - HEADER_HEIGHT);
  const [serverErr, setServerErr] = useState(false);
  const [feed, setFeed] = useState<JSX.Element[]>([]);
  const [selectedTab, setSelectedTab] = useState('general');

  const [profilePicture, setProfilePicture] = useState<string>(); //TODO - Remove this profile picture logic after we update redux store and req.user

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    getProfilePicture();
    getFeed().then(() => {
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    getFeed().then(() => {
      setLoading(false);
    });
  }, [selectedTab]);

  async function getProfilePicture() {
    const { data } = await makeRequest(
      'GET',
      `/api/images/profile/${props.user._id}`,
      {},
      true,
      props.accessToken,
      props.refreshToken
    );
    if (data.success === 1) {
      setProfilePicture(data.content['imageURL']);
    }
  }

  async function getFeed() {
    const { data } = await makeRequest(
      'GET',
      `/api/posts/feed/${selectedTab}`,
      {},
      true,
      props.accessToken,
      props.refreshToken
    );

    if (data.success === 1) {
      setFeed(createFeed(data.content['posts']));
      setServerErr(false);
    } else {
      setServerErr(true);
    }
  }

  function handleResize() {
    setHeight(window.innerHeight - HEADER_HEIGHT);
  }

  function handleDiscoverClick() {
    window.location.href = `${window.location.protocol}//${window.location.host}/discover`;
  }

  function handleTabChange(newTab: string) {
    setSelectedTab(newTab);
  }

  function appendNewPost(post: PostType) {
    setFeed((prevState) => {
      const newEntry = (
        <UserPost
          postID={post._id}
          _id={props.user._id}
          name={`${props.user.firstName} ${props.user.lastName}`}
          timestamp={`${formatDatePretty(new Date(post.createdAt))} at ${formatTime(
            new Date(post.createdAt)
          )}`}
          profilePicture={profilePicture}
          message={post.message}
          likeCount={post.likes}
          commentCount={0}
          style={styles.postBox}
        />
      );
      return [newEntry].concat(prevState);
    });
  }

  function createFeed(posts: PostType[]) {
    const output = [];
    for (let i = 0; i < posts.length; i++) {
      const { anonymous } = posts[i];
      console.log(posts[i])
      output.push(
        <UserPost
          postID={posts[i]._id}
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
          commentCount={posts[i].comments}
          style={styles.postBox}
          key={posts[i]._id}
          toCommunity={posts[i].toCommunity.name}
          toCommunityID={posts[i].toCommunity._id}
          anonymous={anonymous}
          liked={posts[i].liked}
        />
      );
    }
    return output;
  }

  return (
    <div className={styles.wrapper} style={{ height: height }}>
      <Box boxShadow={2} borderRadius={10} className={styles.box}>
        <WelcomeMessage
          title="Welcome to RootShare!"
          message="Every success story is rooted in the support from a community. Join your
        communities or discover new ones today."
          buttonText="Discover"
          buttonAction={handleDiscoverClick}
        />
      </Box>
      <MakePostContainer
        appendNewPost={appendNewPost}
        profilePicture={profilePicture}
      />

      <RSTabs
        tabs={[
          { label: 'General', value: 'general' },
          { label: 'Following', value: 'following' },
        ]}
        onChange={handleTabChange}
        selected={selectedTab}
        className={styles.tabs}
      />
      {loading ? (
        <CircularProgress size={100} className={styles.loadingIndicator} />
      ) : !serverErr ? (
        <div className={styles.posts}>{feed}</div>
      ) : (
        <div style={{ marginTop: 10 }}>
          <RSText size={18} bold type="head" color={colors.primary}>
            There was an error retrieving your posts.
          </RSText>
        </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(HomepageBody);
