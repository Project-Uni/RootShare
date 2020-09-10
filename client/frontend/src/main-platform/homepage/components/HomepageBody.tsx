import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { CircularProgress } from '@material-ui/core';

import { connect } from 'react-redux';

import { colors } from '../../../theme/Colors';
import RSText from '../../../base-components/RSText';

import { WelcomeMessage, UserPost } from '../../reusable-components';
import MakePostContainer from './MakePostContainer';

import { JacksonHeadshot } from '../../../images/team';
import {
  makeRequest,
  formatDatePretty,
  formatTime,
} from '../../../helpers/functions';
import { PostType } from '../../../helpers/types';

const HEADER_HEIGHT = 60;

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    flex: 1,
    background: colors.primaryText,
    overflow: 'scroll',
    minWidth: 600,
  },
  loadingIndicator: {
    color: colors.primary,
    marginTop: 1,
  },
  posts: {
    marginLeft: 1,
    marginRight: 1,
  },
  singlePost: {
    marginTop: 1,
    borderRadius: 1,
  },
  postStyle: {
    borderTop: `1px solid ${colors.fourth}`,
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
  //TODO - Use default state false for this once connected to server, and set to true if its their first visit
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);
  const [serverErr, setServerErr] = useState(false);
  const [generalFeed, setGeneralFeed] = useState<JSX.Element[]>([]);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    getGeneralFeed().then(() => {
      setLoading(false);
    });
  }, []);

  async function getGeneralFeed() {
    const { data } = await makeRequest(
      'GET',
      '/api/posts/feed/general',
      {},
      true,
      props.accessToken,
      props.refreshToken
    );

    if (data.success === 1) {
      setGeneralFeed(createGeneralFeed(data.content['posts']));
      setServerErr(false);
    } else {
      setServerErr(true);
    }
  }

  function handleResize() {
    setHeight(window.innerHeight - HEADER_HEIGHT);
  }

  function closeWelcomeMessage() {
    setShowWelcomeModal(false);
  }

  function handleDiscoverClick() {
    window.location.href = `${window.location.protocol}//${window.location.host}/discover`;
  }

  function appendNewPost(post: PostType) {
    setGeneralFeed((prevState) => {
      const newEntry = (
        <UserPost
          userID={props.user._id}
          userName={`${props.user.firstName} ${props.user.lastName}`}
          timestamp={`${formatDatePretty(new Date(post.createdAt))} at ${formatTime(
            new Date(post.createdAt)
          )}`}
          profilePicture={JacksonHeadshot}
          message={post.message}
          likeCount={post.likes.length}
          commentCount={0}
          style={styles.postStyle}
        />
      );
      return [newEntry].concat(prevState);
    });
  }

  function createGeneralFeed(posts: PostType[]) {
    const output = [];
    for (let i = 0; i < posts.length; i++) {
      output.push(
        <UserPost
          userID={posts[i].user._id}
          userName={`${posts[i].user.firstName} ${posts[i].user.lastName}`}
          timestamp={`${formatDatePretty(
            new Date(posts[i].createdAt)
          )} at ${formatTime(new Date(posts[i].createdAt))}`}
          profilePicture={posts[i].user.profilePicture}
          message={posts[i].message}
          likeCount={posts[i].likes.length}
          commentCount={0}
          style={styles.postStyle}
        />
      );
    }
    return output;
  }

  return (
    <div className={styles.wrapper} style={{ height: height }}>
      {showWelcomeModal && (
        <WelcomeMessage
          title="Welcome to RootShare!"
          message="Every success story is rooted in the support from a community. Join your
        communities or discover new ones today."
          onClose={closeWelcomeMessage}
          buttonText="Discover"
          buttonAction={handleDiscoverClick}
        />
      )}
      <MakePostContainer appendNewPost={appendNewPost} userID={props.user._id} />
      {loading ? (
        <CircularProgress size={100} className={styles.loadingIndicator} />
      ) : !serverErr ? (
        <div className={styles.posts}>{generalFeed}</div>
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
