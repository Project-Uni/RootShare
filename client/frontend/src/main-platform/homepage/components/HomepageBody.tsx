import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom';

import { CircularProgress } from '@material-ui/core';

import { useSelector, useDispatch } from 'react-redux';
import { updateSidebarComponents } from '../../../redux/actions';
import { RootshareReduxState } from '../../../redux/store/stateManagement';

import RSText from '../../../base-components/RSText';
import {
  WelcomeMessage,
  RSTabs,
  // MakePostContainer,
  FeaturedEvent,
} from '../../reusable-components';
import { UserPost } from '../../reusable-components/components/UserPost.v2';
import { MakePostContainer } from '../../reusable-components/components/MakePostContainer.v2';
import { PromotedEvents } from '../../reusable-components/components/PromotedEvents';

import { PostType } from '../../../helpers/types';
import { HEADER_HEIGHT } from '../../../helpers/constants';
import { removeFromStateArray } from '../../../helpers/functions';
import Theme from '../../../theme/Theme';
import { DefaultPromotionBanner } from '../../../images';
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
    marginLeft: 10,
    marginRight: 10,
    marginTop: 15,
    marginBottom: 10,
  },
  box: {
    background: Theme.white,
    margin: 8,
  },
}));

type Props = {};

export default function HomepageBody(props: Props) {
  const styles = useStyles();
  const history = useHistory();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);
  const [height, setHeight] = useState(window.innerHeight - HEADER_HEIGHT);
  const [serverErr, setServerErr] = useState(false);
  const [feed, setFeed] = useState<PostType[]>([]);
  const [selectedTab, setSelectedTab] = useState<'general' | 'following'>('general');

  const profilePicture = useSelector(
    (state: RootshareReduxState) => state.user.profilePicture
  );

  useEffect(() => {
    dispatch(
      updateSidebarComponents({
        names: ['discoverUsers', 'discoverCommunities'],
      })
    );
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
    const { likes, comments, ...rest } = post;
    setFeed((prev) => [{ ...rest, likes: 0, comments: 0 }, ...prev]);
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
        src={DefaultPromotionBanner}
        style={{ margin: 8 }}
        href={undefined}
      />
      <PromotedEvents />
      <MakePostContainer mode={{ name: 'homepage' }} appendPost={appendNewPost} />
      {/* <MakePostContainer
        appendNewPost={appendNewPost}
        profilePicture={profilePicture}
      /> */}

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
              key={post._id}
              post={post}
              style={{ marginTop: idx !== 0 ? 10 : undefined }}
              onDelete={(postID: string) =>
                removeFromStateArray(postID, '_id', setFeed)
              }
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
