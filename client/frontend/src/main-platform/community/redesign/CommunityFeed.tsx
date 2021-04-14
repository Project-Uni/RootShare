import React, { useCallback, useEffect, useRef, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { useDispatch, useSelector } from 'react-redux';
import { dispatchSnackbar } from '../../../redux/actions';
import { RootshareReduxState } from '../../../redux/store/stateManagement';

import { CircularProgress } from '@material-ui/core';
import { UserPost } from '../../reusable-components/components/UserPost.v2';
import { MakePostContainer } from '../../reusable-components/components/MakePostContainer.v2';

import { getPosts, getPinnedPosts, putPinPost } from '../../../api';
import { PostType } from '../../../helpers/types';
import Theme from '../../../theme/Theme';

import { RSTabs } from '../../reusable-components';
import { insertArray } from '../../../helpers/functions';

const useStyles = makeStyles((_: any) => ({ wrapper: {} }));

type Props = {
  communityID: string;
  admin: string;
  isMember: boolean;
  isPrivate?: boolean;
};

const TabValues = [
  'community-external',
  'community-internal-student',
  'community-internal-alumni',
  'community-following',
] as const;

export const CommunityFeed = (props: Props) => {
  const styles = useStyles();
  const { communityID, admin, isPrivate, isMember } = props;

  const dispatch = useDispatch();
  const user = useSelector((state: RootshareReduxState) => state.user);

  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<PostType[]>([]);
  const [pinnedPosts, setPinnedPosts] = useState<PostType[]>([]);

  const [tabs, setTabs] = useState([
    { label: 'External', value: 'community-external' },
    { label: 'Following', value: 'community-following' },
  ]);
  const [selectedTab, setSelectedTab] = useState<typeof TabValues[number]>(
    'community-external'
  );

  const tabChangeSemaphore = useRef(0);

  useEffect(() => {
    tabChangeSemaphore.current += 1;
  }, [selectedTab]);

  useEffect(() => {
    if (isPrivate && isMember) {
      const clone = [...tabs];
      if (admin === user._id) {
        insertArray(clone, 1, {
          label: 'Internal Current',
          value: 'community-internal-student',
        });
        insertArray(clone, 1, {
          label: 'Internal Alumni',
          value: 'community-internal-alumni',
        });
      } else {
        insertArray(clone, 1, {
          label: 'Internal',
          value:
            user.accountType === 'student'
              ? 'community-internal-student'
              : 'community-internal-alumni',
        });
      }
      setTabs(clone);
    }
  }, []);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const currSemaphoreState = tabChangeSemaphore.current;
    const data = await getPosts({
      postType: { type: selectedTab, params: { communityID } },
    });
    if (tabChangeSemaphore.current === currSemaphoreState) {
      if (data.success === 1) {
        setPosts(data.content.posts);
      } else {
        dispatch(
          dispatchSnackbar({
            mode: 'error',
            message: 'There was an error retrieving posts',
          })
        );
      }
    }
    setLoading(false);
  }, [selectedTab]);

  useEffect(() => {
    setLoading(true);
    const promises: Promise<void>[] = [];
    promises.push(fetchPosts());
    if (selectedTab === 'community-external') promises.push(fetchPinnedPosts());

    Promise.all(promises).then(() => setLoading(false));
  }, [fetchPosts]);

  const fetchPinnedPosts = async () => {
    const data = await getPinnedPosts({ communityID });
    if (data.success === 1) {
      setPinnedPosts(data.content.posts);
    }
  };

  const handlePinPostClicked = async (postID: string) => {
    const data = await putPinPost({ postID, communityID });
    if (data.success === 1) {
      dispatch(
        dispatchSnackbar({ mode: 'notify', message: 'Successfully pinned post' })
      );
      return true;
    } else {
      dispatch(
        dispatchSnackbar({
          mode: 'error',
          message: 'Failed to pin post. Please try again later',
        })
      );
      return false;
    }
  };

  const appendPost = (post: PostType) => {
    setPosts((prev) => [post, ...prev]);
  };

  return (
    <div className={styles.wrapper}>
      {selectedTab !== 'community-following' && (
        <MakePostContainer
          style={{ marginTop: 15 }}
          mode={{ name: selectedTab, communityID, admin: user._id === admin }}
          appendPost={appendPost}
          disabled={loading}
        />
      )}
      <RSTabs
        tabs={tabs}
        selected={selectedTab}
        onChange={setSelectedTab}
        style={{ marginLeft: 10, marginRight: 10 }}
      />
      {loading ? (
        <CircularProgress size={90} style={{ color: Theme.bright, marginTop: 50 }} />
      ) : (
        <>
          {selectedTab === 'community-external'
            ? pinnedPosts.map((post) => (
                <UserPost
                  post={post}
                  style={{ marginTop: 15 }}
                  options={{
                    hideToCommunity: true,
                    pinToCommunityMenuItem:
                      admin === user._id
                        ? { value: true, onPin: handlePinPostClicked }
                        : undefined,
                    pinned: true,
                  }}
                />
              ))
            : undefined}
          {posts
            .filter(
              (post) =>
                !pinnedPosts.some((pinnedPost) => pinnedPost._id === post._id)
            )
            .map((post) => (
              <UserPost
                post={post}
                style={{ marginTop: 15 }}
                options={{
                  hideToCommunity: true,
                  pinToCommunityMenuItem:
                    admin === user._id
                      ? { value: true, onPin: handlePinPostClicked }
                      : undefined,
                }}
              />
            ))}
        </>
      )}
    </div>
  );
};
