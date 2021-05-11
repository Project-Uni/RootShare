import React, { useCallback, useEffect, useState } from 'react';
import { makeStyles, Theme as MuiTheme } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom';
import { useParams } from 'react-router';

import { CircularProgress } from '@material-ui/core';

import { UserPost } from '../reusable-components/components/UserPost.v2';
import { RSLink } from '../reusable-components';
import { RSText } from '../../base-components';

import { getPostById } from '../../api';
import { PostType, PostAccessError } from '../../helpers/types';
import Theme from '../../theme/Theme';

const useStyles = makeStyles((muiTheme: MuiTheme) => ({
  wrapper: {
    display: 'flex',
    justifyContent: 'center',
  },
}));

type Props = {};

export const PostPage = (props: Props) => {
  const styles = useStyles();

  const history = useHistory();

  const { postID } = useParams<{ postID: string }>();

  const [post, setPost] = useState<PostType>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<PostAccessError>();

  const fetchPost = useCallback(async () => {
    if (!loading) setLoading(true);
    if (error) setError(undefined);

    const data = await getPostById(postID);

    if (data.success === 1) {
      setPost(data.content.post);
      setError(data.content.post.accessErr);
    } else setError('unknown');

    setLoading(false);
  }, [postID]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const renderError = () => {
    if (error === 'unknown')
      return (
        <RSText bold size={14} style={{ marginTop: 20, maxWidth: 400 }}>
          There was an error getting this post
        </RSText>
      );

    if (error === 'not-member')
      return (
        <RSText bold size={14} style={{ marginTop: 20, maxWidth: 400 }}>
          Can't access post because you aren't a member of{' '}
          <RSLink
            href={`/community/${post?.toCommunity?._id}`}
            style={{ color: Theme.bright }}
            underline="hover"
          >
            {post?.toCommunity?.name || ''}
          </RSLink>
        </RSText>
      );

    if (error === 'not-student')
      return (
        <RSText bold size={14} style={{ marginTop: 20, maxWidth: 400 }}>
          Can't access post because it was posted by a current member of{' '}
          <RSLink
            href={`/community/${post?.toCommunity?._id}`}
            style={{ color: Theme.bright }}
            underline="hover"
          >
            {post?.toCommunity?.name || ''}
          </RSLink>{' '}
          and you are not a student
        </RSText>
      );

    if (error === 'not-alumni')
      return (
        <RSText bold size={14} style={{ marginTop: 20, maxWidth: 400 }}>
          Can't access post because it was posted by an alumni of{' '}
          <RSLink
            href={`/community/${post?.toCommunity?._id}`}
            style={{ color: Theme.bright }}
            underline="hover"
          >
            {post?.toCommunity?.name || ''}
          </RSLink>{' '}
          and you are not an alumni
        </RSText>
      );
  };

  return (
    <div className={styles.wrapper}>
      {error ? (
        renderError()
      ) : loading || !post ? (
        <CircularProgress style={{ marginTop: 50 }} size={80} />
      ) : (
        <UserPost post={post} onDelete={() => history.push('/home')} />
      )}
    </div>
  );
};
