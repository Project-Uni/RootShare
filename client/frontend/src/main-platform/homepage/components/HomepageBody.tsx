import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { CircularProgress, Box } from '@material-ui/core';

import { connect } from 'react-redux';

import RSText from '../../../base-components/RSText';

import {
  WelcomeMessage,
  RSTabs,
  MakePostContainer,
  FeaturedEvent,
} from '../../reusable-components';
import { UserPost } from '../../reusable-components/components/UserPost.v2';

import { PostType } from '../../../helpers/types';
import { HEADER_HEIGHT } from '../../../helpers/constants';
import Theme from '../../../theme/Theme';
import { useHistory } from 'react-router-dom';
import WinningDevPlanBanner from '../../../images/eventBanner/winningDevPlan.png';
import { getPosts } from '../../../api';

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
  loadingIndicator: {
    color: Theme.bright,
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
    background: Theme.white,
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
  const history = useHistory();

  const [loading, setLoading] = useState(true);
  const [height, setHeight] = useState(window.innerHeight - HEADER_HEIGHT);
  const [serverErr, setServerErr] = useState(false);
  const [feed, setFeed] = useState<PostType[]>([]);
  const [selectedTab, setSelectedTab] = useState<'general' | 'following'>('general');

  useEffect(() => {
    window.addEventListener('resize', handleResize);
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

  async function getFeed() {
    const data = await getPosts({ postType: { type: selectedTab } });
    if (data.success === 1) {
      setFeed(data.content['posts']);
      setServerErr(false);
    } else {
      setServerErr(true);
    }
  }

  function handleResize() {
    setHeight(window.innerHeight - HEADER_HEIGHT);
  }

  function handleDiscoverClick() {
    history.push(`/discover`);
  }

  function handleTabChange(newTab: 'general' | 'following') {
    setSelectedTab(newTab);
  }

  function appendNewPost(post: PostType) {
    setFeed((prev) => [post, ...prev]);
  }

  return (
    <div className={styles.wrapper} style={{ height: height }}>
      {/* <Box boxShadow={2} borderRadius={10} className={styles.box}>
        <WelcomeMessage
          title="Welcome to RootShare!"
          message="Every success story is rooted in the support from a community. Join your
        communities or discover new ones today."
          buttonText="Discover"
          buttonAction={handleDiscoverClick}
        />
      </Box> */}
      <FeaturedEvent
        src={WinningDevPlanBanner}
        style={{ margin: 8 }}
        href={'/event/6026ce709a7a1f218592ea37'}
      />
      <MakePostContainer
        appendNewPost={appendNewPost}
        profilePicture={props.user.profilePicture}
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
        <div className={styles.posts}>
          {feed.map((post, idx) => (
            <UserPost
              post={post}
              style={{ marginTop: idx !== 0 ? 10 : undefined }}
            />
          ))}
        </div>
      ) : (
        <div style={{ marginTop: 10 }}>
          <RSText size={18} bold type="head" color={Theme.primary}>
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
