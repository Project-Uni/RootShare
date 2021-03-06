import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { getPosts } from '../../../api';
import { PostType } from '../../../helpers/types';
import { useDispatch } from 'react-redux';
import { dispatchSnackbar } from '../../../redux/actions';
import { CircularProgress } from '@material-ui/core';
import { UserPost } from '../../reusable-components/components/UserPost.v2';
import { MakePostContainer } from '../../reusable-components/components/MakePostContainer.v2';
import Theme from '../../../theme/Theme';

const useStyles = makeStyles((_: any) => ({ wrapper: {} }));

type Props = {
  communityID: string;
};

export const CommunityFeed = (props: Props) => {
  const styles = useStyles();
  const { communityID } = props;

  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<PostType[]>();

  useEffect(() => {
    fetchPosts().then(() => setLoading(false));
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

  return (
    <div className={styles.wrapper}>
      <MakePostContainer style={{ marginTop: 15 }} />
      {loading ? (
        <CircularProgress size={90} style={{ color: Theme.bright, marginTop: 50 }} />
      ) : (
        posts?.map((post) => (
          <UserPost
            post={post}
            style={{ marginTop: 15 }}
            options={{ hideToCommunity: true }}
          />
        ))
      )}
    </div>
  );
};
