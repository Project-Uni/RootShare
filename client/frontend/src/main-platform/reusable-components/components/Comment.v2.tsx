import React, { useCallback, useRef, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { useDispatch } from 'react-redux';
import {
  dispatchHoverPreview,
  dispatchSnackbar,
  hoverPreviewTriggerComponentExit,
} from '../../../redux/actions';

import { FaLeaf } from 'react-icons/fa';
import { Avatar } from '@material-ui/core';

import { RSText } from '../../../base-components';
import { RSLink, RSIconButton } from '..';

import { formatPostTime } from './UserPost.v2';
import Theme from '../../../theme/Theme';
import { putCommentLikeStatus } from '../../../api';
import { formatLargeNumber } from '../../../helpers/functions';
import { usePrevious } from '../../../helpers/hooks';

const useStyles = makeStyles((_: any) => ({ wrapper: {} }));

export type CommentType = {
  createdAt: string;
  _id: string;
  post: string;
  message: string;
  likes: number;
  liked: boolean;
  user: {
    firstName: string;
    lastName: string;
    _id: string;
    profilePicture?: string;
    major?: string;
    graduationYear: number;
    work?: string;
    position?: string;
  };
  updatedAt: string;
};

type Props = {
  className?: string;
  style?: React.CSSProperties;
  comment: CommentType;
};

export const Comment = (props: Props) => {
  const { className, style, comment } = props;
  const styles = useStyles();

  const dispatch = useDispatch();

  const [numLikes, setNumLikes] = useState(comment.likes);
  const [liked, setLiked] = useState(comment.liked);
  const previousLiked = usePrevious(liked);

  const isHovering = useRef(false);

  const handleMouseOver = (e: React.MouseEvent<HTMLElement>) => {
    isHovering.current = true;
    const currentTarget = e.currentTarget;
    setTimeout(() => {
      if (isHovering.current)
        dispatch(
          dispatchHoverPreview({
            _id: comment.user._id,
            type: 'user',
            profilePicture: comment.user.profilePicture,
            name: `${comment.user.firstName} ${comment.user.lastName}`,
            anchorEl: currentTarget,
          })
        );
    }, 750);
  };

  const updateLikedStatus = useCallback(async () => {
    const newLiked =
      previousLiked === undefined || previousLiked === liked
        ? !liked
        : previousLiked;
    setLiked(newLiked);
    setNumLikes((prevNumLikes) => (newLiked ? prevNumLikes + 1 : prevNumLikes - 1));

    const data = await putCommentLikeStatus(comment._id, comment.post, newLiked);
    if (data.success !== 1) {
      setLiked(!newLiked);
      setNumLikes((prevNumLikes) =>
        newLiked ? prevNumLikes - 1 : prevNumLikes + 1
      );
      dispatch(
        dispatchSnackbar({
          mode: 'error',
          message: 'There was an error liking the comment',
        })
      );
    }
  }, [previousLiked, liked]);

  const getUserDescription = useCallback(() => {
    const {
      user: { major, graduationYear, position, work },
    } = comment;

    let description = '';
    if (major && graduationYear) description += `${major} ${graduationYear}`;

    if (major && graduationYear && position && work) description += '  |  ';
    if (position) description += position;
    if (position && work) description += ' @ ';
    if (work) description += work;

    return description;
  }, [comment]);

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        marginLeft: 20,
        marginRight: 20,
        ...style,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignSelf: 'stretch',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
        }}
      >
        <RSLink href={`/profile/${comment.user._id}`}>
          <Avatar
            src={comment.user.profilePicture}
            style={{ height: 50, width: 50 }}
            onMouseEnter={handleMouseOver}
            onMouseLeave={() => {
              isHovering.current = false;
              setTimeout(() => {
                dispatch(hoverPreviewTriggerComponentExit());
              }, 500);
            }}
          />
        </RSLink>
        <RSIconButton
          Icon={FaLeaf}
          text={formatLargeNumber(numLikes)}
          textSize={10}
          onClick={updateLikedStatus}
          selected={liked}
          primaryColor={Theme.secondaryText}
          highlightColor={Theme.bright}
        />
      </div>
      <div
        style={{
          flex: 1,
          backgroundColor: Theme.background,
          textAlign: 'left',
          padding: 12,
          marginLeft: 10,
          borderTopRightRadius: 15,
          borderBottomRightRadius: 15,
          borderBottomLeftRadius: 15,
        }}
        id="comment-body"
      >
        <div style={{ display: 'flex' }}>
          <RSLink href={`/profile/${comment.user._id}`} underline="hover">
            <RSText
              size={11}
              bold
              onMouseEnter={handleMouseOver}
              onMouseLeave={() => {
                isHovering.current = false;
                setTimeout(() => {
                  dispatch(hoverPreviewTriggerComponentExit());
                }, 500);
              }}
            >
              <span style={{ flex: 1 }} />
              {comment.user.firstName} {comment.user.lastName}
            </RSText>
          </RSLink>
        </div>
        <RSText size={10} color={Theme.secondaryText}>
          {getUserDescription()}
        </RSText>
        <RSText size={10} color={Theme.secondaryText}>
          {formatPostTime(comment.createdAt)}
        </RSText>

        <RSText size={11} color={Theme.secondaryText} style={{ marginTop: 10 }}>
          {comment.message}
        </RSText>
      </div>
    </div>
  );
};
