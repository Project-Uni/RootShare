import React, { useRef, useState, useEffect, useCallback } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { RSCard } from './RSCard';
import { Avatar, IconButton } from '@material-ui/core';
import { FaEllipsisH, FaLeaf, FaRegComment } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { RootshareReduxState } from '../../../redux/store/stateManagement';
import { DynamicIconButton, RSText } from '../../../base-components';
import Theme from '../../../theme/Theme';
import { RSTextField } from './RSTextField';
import { MdSend } from 'react-icons/md';
import { RightArrow } from '../../../images';
import { PostType } from '../../../helpers/types';
import { RSLink } from './RSLink';
import dayjs from 'dayjs';
import {
  dispatchHoverPreview,
  hoverPreviewTriggerComponentExit,
} from '../../../redux/actions';
import Carousel, { Modal, ModalGateway } from 'react-images';
import { useHistory } from 'react-router-dom';
import { putLikeStatus } from '../../../api';

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
  likes: {
    '&:hover': {
      textDecoration: 'underline',
      cursor: 'pointer',
    },
    zIndex: 2,
  },
}));

type Props = {
  className?: string;
  style?: React.CSSProperties;
  post: PostType;
};

export const UserPost = (props: Props) => {
  const styles = useStyles();
  const { className, style, post } = props;

  const history = useHistory();

  const user = useSelector((state: RootshareReduxState) => state.user);
  const dispatch = useDispatch();

  const [showCommentField, setShowCommentField] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);

  const [likeCount, setLikeCount] = useState(post.likes);
  const [liked, setLiked] = useState(post.liked);
  const [likeDisabled, setLikeDisabled] = useState(false);

  const isHovering = useRef(false);

  useEffect(() => {
    const removeHistoryListen = history.listen((location, action) => {
      if (isHovering.current) isHovering.current = false;
    });
    return removeHistoryListen;
  }, [history]);

  const handleSproutClick = async (action: 'like' | 'unlike') => {
    setLikeDisabled(true);
    const data = await putLikeStatus(post._id, action);
    //Adding the UI update before API call completes, and resetting back to original if it fails
    if (action === 'unlike') {
      setLiked(false);
      setLikeCount(likeCount - 1);
    } else {
      setLiked(true);
      setLikeCount(likeCount + 1);
    }

    if (data.success !== 1) {
      if (action === 'unlike') {
        setLiked(true);
        setLikeCount(likeCount + 1);
      } else {
        setLiked(false);
        setLikeCount(likeCount - 1);
      }
    }
    setLikeDisabled(false);
  };

  const handleCommentIconClick = () => {
    setShowCommentField((prev) => !prev);
  };
  const handleCommentTextClick = () => {
    setShowComments((prev) => !prev);
  };

  const anonymousCleanedData = {
    posterName: post.anonymous
      ? post.fromCommunity?.name
      : `${post.user.firstName} ${post.user.lastName}`,
    posterID: post.anonymous ? post.fromCommunity?._id : post.user._id,
    posterNavigationURL: post.anonymous
      ? `/community/${post.fromCommunity?._id}`
      : `/profile/${post.user._id}`,
    posterProfilePicture: post.anonymous
      ? post.fromCommunity?.profilePicture
      : post.user.profilePicture,
    toEntityNavigationURL: `/community/${post.toCommunity?._id}`,
  };

  const getUserDescription = useCallback(() => {
    if (post.anonymous) return;

    const { major, graduationYear, position, work } = post.user;

    let description = '';
    if (major && graduationYear)
      description += `${post.user.major} ${post.user.graduationYear}`;

    if (major && graduationYear && position && work) description += '  |  ';
    if (position) description += position;
    if (position && work) description += ' @ ';
    if (work) description += work;

    return description;
  }, [post]);

  const handleMouseOverFrom = (e: React.MouseEvent<HTMLElement>) => {
    isHovering.current = true;
    const currentTarget = e.currentTarget;
    setTimeout(() => {
      if (isHovering.current)
        dispatch(
          dispatchHoverPreview({
            _id: anonymousCleanedData.posterID!,
            type: post.anonymous ? 'community' : 'user',
            profilePicture: anonymousCleanedData.posterProfilePicture,
            name: anonymousCleanedData.posterName!,
            anchorEl: currentTarget,
          })
        );
    }, 500);
  };

  const handleMouseOverTo = (e: React.MouseEvent<HTMLElement>) => {
    isHovering.current = true;
    const currentTarget = e.currentTarget;
    setTimeout(() => {
      if (isHovering.current)
        dispatch(
          dispatchHoverPreview({
            _id: post.toCommunity!._id,
            type: 'community',
            profilePicture: post.toCommunity?.profilePicture,
            name: post.toCommunity!.name,
            anchorEl: currentTarget,
          })
        );
    }, 500);
  };

  return (
    <RSCard
      variant="secondary"
      style={{ paddingTop: 20, paddingBottom: 20, ...style }}
      className={className}
    >
      <div
        id="top"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginLeft: 30,
          marginRight: 30,
        }}
      >
        <div
          id="avatar-and-name"
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <RSLink href={anonymousCleanedData.posterNavigationURL} underline={false}>
            <div
              onMouseEnter={handleMouseOverFrom}
              onMouseLeave={() => {
                isHovering.current = false;
                setTimeout(() => {
                  dispatch(hoverPreviewTriggerComponentExit());
                }, 500);
              }}
            >
              <Avatar
                src={anonymousCleanedData.posterProfilePicture}
                style={{ height: 70, width: 70 }}
              />
            </div>
          </RSLink>
          <div id="name-and-info" style={{ textAlign: 'left', marginLeft: 15 }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <RSLink
                href={anonymousCleanedData.posterNavigationURL}
                underline={false}
              >
                <div
                  onMouseEnter={handleMouseOverFrom}
                  onMouseLeave={() => {
                    isHovering.current = false;
                    setTimeout(() => {
                      dispatch(hoverPreviewTriggerComponentExit());
                    }, 500);
                  }}
                >
                  <RSText bold>{anonymousCleanedData.posterName}</RSText>
                </div>
              </RSLink>
              {post.toCommunity && (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <img
                    src={RightArrow}
                    style={{ marginLeft: 15, marginRight: 15, height: 12 }}
                    alt="to"
                  />
                  <RSLink
                    href={anonymousCleanedData.toEntityNavigationURL}
                    underline={false}
                  >
                    <div
                      onMouseEnter={handleMouseOverTo}
                      onMouseLeave={() => {
                        isHovering.current = false;
                        setTimeout(() => {
                          dispatch(hoverPreviewTriggerComponentExit());
                        }, 500);
                      }}
                    >
                      <RSText bold>{post.toCommunity?.name}</RSText>
                    </div>
                  </RSLink>
                </div>
              )}
            </div>
            <RSText size={11} color={Theme.secondaryText}>
              {getUserDescription()}
            </RSText>
            <RSText size={11} color={Theme.secondaryText}>
              {dayjs(post.createdAt).format(
                `h:mm a on MMM D${
                  new Date().getFullYear() !== new Date(post.createdAt).getFullYear()
                    ? ', YYYY'
                    : ''
                }`
              )}
            </RSText>
          </div>
        </div>
        <IconButton style={{ height: '100%' }}>
          <FaEllipsisH size={20} />
        </IconButton>
      </div>
      <RSText
        style={{
          marginLeft: 30,
          marginRight: 30,
          marginTop: 20,
          marginBottom: 25,
          textAlign: 'left',
        }}
        color={Theme.secondaryText}
      >
        {post.message}
      </RSText>
      {post.images.length > 0 ? (
        <img
          src={post.images[0].fileName}
          style={{ height: 300, width: '100%', objectFit: 'cover' }}
          onClick={() => setIsImageViewerOpen(true)}
        />
      ) : (
        <></>
      )}
      <div
        id="likes-and-comment-counts"
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          marginLeft: 30,
          marginRight: 30,
          marginTop: 10,
          marginBottom: 5,
        }}
      >
        <RSText color={Theme.secondaryText} className={styles.likes} size={11}>
          {likeCount} Sprouts
        </RSText>
        <RSText
          color={Theme.secondaryText}
          className={styles.likes}
          style={{ marginLeft: 15 }}
          onClick={handleCommentTextClick}
          size={11}
        >
          {post.comments} Comments
        </RSText>
      </div>
      <div
        id="action-icons"
        style={{
          display: 'flex',
          flex: 1,
          justifyContent: 'flex-start',
          marginLeft: 20,
          marginRight: 20,
        }}
      >
        <DynamicIconButton
          onClick={() => handleSproutClick(liked ? 'unlike' : 'like')}
          disabled={likeDisabled}
        >
          <div
            style={{
              display: 'flex',
              width: '100%',
              height: '100%',
              alignItems: 'center',
            }}
          >
            <FaLeaf color={liked ? Theme.bright : Theme.secondaryText} />
            <RSText color={Theme.secondaryText} style={{ marginLeft: 10 }}>
              Sprout
            </RSText>
          </div>
        </DynamicIconButton>
        <DynamicIconButton onClick={handleCommentIconClick}>
          <div
            style={{
              display: 'flex',
              width: '100%',
              height: '100%',
              alignItems: 'center',
            }}
          >
            <FaRegComment />
            <RSText color={Theme.secondaryText} style={{ marginLeft: 10 }}>
              Comment
            </RSText>
          </div>
        </DynamicIconButton>
      </div>

      {showCommentField ? (
        <div
          style={{
            marginLeft: 20,
            marginRight: 20,
            marginBottom: 10,
            display: 'flex',
          }}
        >
          <RSTextField label={'Add a comment...'} variant="outlined" fullWidth />
          <DynamicIconButton onClick={() => {}}>
            <MdSend size={22} color={Theme.bright} />
          </DynamicIconButton>
        </div>
      ) : (
        <></>
      )}

      {showComments ? (
        <div id="comments">
          <Comment />
          <Comment style={{ marginTop: 10 }} />
        </div>
      ) : (
        <></>
      )}
      <RSText
        className={styles.likes}
        style={{ textAlign: 'left', marginLeft: 20, marginRight: 20 }}
        color={Theme.secondaryText}
      >
        Load More Comments
      </RSText>
      <ModalGateway>
        {isImageViewerOpen && (
          <Modal onClose={() => setIsImageViewerOpen(false)}>
            <Carousel
              views={post.images?.map((image) => ({ source: image.fileName })) || []}
            />
          </Modal>
        )}
      </ModalGateway>
    </RSCard>
  );
};

type CommentProps = {
  className?: string;
  style?: React.CSSProperties;
};
const Comment = (props: CommentProps) => {
  const { className, style } = props;
  const styles = useStyles();

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
      <Avatar src={undefined} style={{ height: 50, width: 50 }} />
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
        <RSText size={11} bold>
          Smit Desai
        </RSText>
        <RSText size={10} color={Theme.secondaryText}>
          Computer Science 2020 | Software Development Engineer @ Amazon
        </RSText>
        <RSText size={10} color={Theme.secondaryText}>
          Mar 01
        </RSText>

        <RSText size={11} color={Theme.secondaryText} style={{ marginTop: 10 }}>
          Swine pork chop jowl pork belly boudin chuck, beef pastrami prosciutto
          burgdoggen doner. Spare ribs boudin prosciutto tail t-bone. Leberkas tail
          buffalo sausage kevin. Leberkas shoulder salami chislic pork loin, ham
          jerky turkey rump tenderloin meatloaf. Chislic meatloaf spare ribs strip
          steak hamburger bacon, pancetta burgdoggen corned beef sausage.
        </RSText>
      </div>
    </div>
  );
};
