import React, { useCallback, useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { getPosts, getPinnedPosts } from '../../../api';
import { PostType } from '../../../helpers/types';
import { useDispatch, useSelector } from 'react-redux';
import { dispatchSnackbar } from '../../../redux/actions';
import { CircularProgress } from '@material-ui/core';
import { UserPost } from '../../reusable-components/components/UserPost.v2';
import { MakePostContainer } from '../../reusable-components/components/MakePostContainer.v2';
import Theme from '../../../theme/Theme';
import { RootshareReduxState } from '../../../redux/store/stateManagement';
import { putPinPost } from '../../../api/put';

const useStyles = makeStyles((_: any) => ({ wrapper: {} }));

type Props = {
  communityID: string;
  admin: string;
};

export const CommunityFeed = (props: Props) => {
  const styles = useStyles();
  const { communityID, admin } = props;

  const dispatch = useDispatch();
  const user = useSelector((state: RootshareReduxState) => state.user);

  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<PostType[]>([]);
  const [pinnedPosts, setPinnedPosts] = useState<PostType[]>([]);

  useEffect(() => {
    const promises: Promise<void>[] = [];
    promises.push(fetchPosts());
    promises.push(fetchPinnedPosts());

    Promise.all(promises).then(() => setLoading(false));
  }, []);

  const fetchPosts = async () => {
    const data = await getPosts({
      postType: { type: 'community-external', params: { communityID } },
    });
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
  };

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
    } else {
      dispatch(
        dispatchSnackbar({
          mode: 'error',
          message: 'Failed to pin post. Please try again later',
        })
      );
    }
  };

  const appendPost = (post: PostType) => {
    setPosts((prev) => [post, ...prev]);
  };

  const filterPosts = useCallback(() => {
    const pinnedIds = pinnedPosts.map((p) => p._id);
    return posts.filter((post) => !pinnedIds.includes(post._id));
  }, [posts, pinnedPosts]);

  return (
    <div className={styles.wrapper}>
      <MakePostContainer
        style={{ marginTop: 15 }}
        mode={{ name: 'community-external', communityID, admin: user._id === admin }}
        appendPost={appendPost}
      />
      {loading ? (
        <CircularProgress size={90} style={{ color: Theme.bright, marginTop: 50 }} />
      ) : (
        <>
          {pinnedPosts.map((post) => (
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
          ))}
          {filterPosts().map((post) => (
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
