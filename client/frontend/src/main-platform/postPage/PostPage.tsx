import React, { useCallback, useEffect, useState } from 'react';
import { makeStyles, Theme as MuiTheme } from '@material-ui/core/styles';
import { getPostById } from '../../api';
import { UserPost } from '../reusable-components/components/UserPost.v2';
import { PostType } from '../../helpers/types';
import { CircularProgress } from '@material-ui/core';
import { useParams } from 'react-router';
import { RSText } from '../../base-components';

const useStyles = makeStyles((muiTheme: MuiTheme) => ({ wrapper: {} }));

type Props = {};

export const PostPage = (props: Props) => {
  const styles = useStyles();

  const { postID } = useParams<{ postID: string }>();

  const [post, setPost] = useState<PostType>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchPost = useCallback(async () => {
    if (!loading) setLoading(true);
    if (error) setError(false);

    const data = await getPostById(postID);

    if (data.success === 1) setPost(data.content.post);
    else setError(true);

    setLoading(false);
  }, [postID]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  return (
    <div className={styles.wrapper}>
      {error ? (
        <RSText bold size={14} style={{ marginTop: 20 }}>
          There was an error getting this post
        </RSText>
      ) : loading || !post ? (
        <CircularProgress style={{ marginTop: 50 }} size={80} />
      ) : (
        <UserPost post={post} />
      )}
    </div>
  );
};
