import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import dayjs from 'dayjs';

import { useDispatch, useSelector } from 'react-redux';
import { RootshareReduxState } from '../../../redux/store/stateManagement';
import {
  dispatchHoverPreview,
  dispatchSnackbar,
  hoverPreviewTriggerComponentExit,
} from '../../../redux/actions';

import { IoTrashBinOutline, IoCopyOutline } from 'react-icons/io5';
import { RiPushpin2Line, RiPushpin2Fill } from 'react-icons/ri';
import { MdReportProblem, MdSend } from 'react-icons/md';
import { FaEllipsisH, FaLeaf, FaRegComment } from 'react-icons/fa';
import Carousel, { Modal, ModalGateway } from 'react-images';
import {
  Avatar,
  Button,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
} from '@material-ui/core';

import { RSCard } from './RSCard';
import { DynamicIconButton, RSText } from '../../../base-components';
import { RSTextField } from './RSTextField';
import { PostType } from '../../../helpers/types';
import { RSLink } from './RSLink';
import LikesModal from './LikesModal';
import { Comment, CommentType } from './Comment.v2';

import {
  postSubmitComment,
  deletePost,
  getCommentsForPost,
  putPostLikeStatus,
} from '../../../api';
import Theme from '../../../theme/Theme';
import { RightArrow } from '../../../images';

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
  likes: {
    '&:hover': {
      textDecoration: 'underline',
      cursor: 'pointer',
    },
    zIndex: 2,
  },
  image: {
    '&:hover': {
      cursor: 'pointer',
    },
  },
  menuItem: {
    display: 'flex',
    justifyContent: 'flex-start',
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 5,
    paddingBottom: 5,
  },
}));

type Props = {
  className?: string;
  style?: React.CSSProperties;
  post: PostType;
  options?: {
    hideToCommunity?: boolean;
    pinToCommunityMenuItem?: {
      value: boolean;
      onPin: (postID: string) => Promise<boolean>;
    };
    pinned?: boolean;
  };
};

export const UserPost = (props: Props) => {
  const styles = useStyles();
  const { className, style, post, options } = props;

  const history = useHistory();

  const user = useSelector((state: RootshareReduxState) => state.user);
  const dispatch = useDispatch();

  const [showCommentField, setShowCommentField] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement>();
  const [showLikesModal, setShowLikesModal] = useState(false);

  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [liked, setLiked] = useState(post.liked);
  const [likeDisabled, setLikeDisabled] = useState(false);

  const [commentText, setCommentText] = useState('');
  const [commentCount, setCommentCount] = useState(post.comments);
  const [commentErr, setCommentErr] = useState<string>();
  const [comments, setComments] = useState<CommentType[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);

  const isHovering = useRef(false);
  const [isDeleted, setIsDeleted] = useState(false);

  const [pinned, setPinned] = useState(options?.pinned || false);

  useEffect(() => {
    const removeHistoryListen = history.listen((location, action) => {
      if (isHovering.current) isHovering.current = false;
    });
    return removeHistoryListen;
  }, [history]);

  const handleSproutClick = async (like: boolean) => {
    setLikeDisabled(true);
    if (!like) {
      setLiked(false);
      setLikeCount((prevLikeCount) => prevLikeCount - 1);
    } else {
      setLiked(true);
      setLikeCount((prevLikeCount) => prevLikeCount + 1);
    }

    const data = await putPostLikeStatus(post._id, like);
    //Adding the UI update before API call completes, and resetting back to original if it fails

    if (data.success !== 1) {
      if (!like) {
        setLiked(true);
        setLikeCount((prevLikeCount) => prevLikeCount + 1);
      } else {
        setLiked(false);
        setLikeCount((prevLikeCount) => prevLikeCount - 1);
      }
    }
    setLikeDisabled(false);
  };

  const handleCommentIconClick = () => {
    setShowCommentField((prev) => !prev);
  };
  const handleCommentTextClick = async () => {
    if (!showComments && commentCount > 0) {
      await fetchComments({});
    } else {
      setComments([]);
    }
    setShowComments((prev) => !prev);
  };

  const [anonymousCleanedData, setAnonymousCleanedData] = useState<{
    posterName: string;
    posterID: string;
    posterNavigationURL: string;
    posterProfilePicture?: string;
    toEntityNavigationURL: string;
  }>();

  const createAnonymousCleanedData = useCallback(() => {
    return {
      posterName: post.anonymous
        ? post.fromCommunity?.name!
        : `${post.user.firstName} ${post.user.lastName}`,
      posterID: post.anonymous ? post.fromCommunity?._id! : post.user._id,
      posterNavigationURL: post.anonymous
        ? `/community/${post.fromCommunity?._id!}`
        : `/profile/${post.user._id}`,
      posterProfilePicture: post.anonymous
        ? post.fromCommunity?.profilePicture
        : post.user.profilePicture,
      toEntityNavigationURL: `/community/${post.toCommunity?._id}`,
    };
  }, [post]);

  useEffect(() => {
    setAnonymousCleanedData(createAnonymousCleanedData());
  }, [createAnonymousCleanedData]);

  const getUserDescription = useCallback(() => {
    if (post.anonymous) return;

    const { major, graduationYear, position, work } = post.user;

    let description = '';
    if (major && graduationYear) description += `${major} ${graduationYear}`;

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
            _id: anonymousCleanedData?.posterID!,
            type: post.anonymous ? 'community' : 'user',
            profilePicture: anonymousCleanedData?.posterProfilePicture!,
            name: anonymousCleanedData?.posterName!,
            anchorEl: currentTarget,
          })
        );
    }, 750);
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
    }, 750);
  };

  const fetchComments = async ({
    fromLastComment,
  }: {
    fromLastComment?: boolean;
  }) => {
    if (!loadingComments) {
      setLoadingComments(true);
      const data = await getCommentsForPost({
        postID: post._id,
        startFromTimestamp: fromLastComment
          ? comments[comments.length - 1].createdAt
          : undefined,
      });
      if (data.success == 1) {
        setComments((prev) => prev.concat(data.content.comments));
      }
      setLoadingComments(false);
    }
  };

  const submitComment = useCallback(async () => {
    if (!commentText?.trim()) {
      setCommentErr("That's not a comment!");
      return;
    }
    setCommentErr(undefined);
    const message = commentText!.trim();
    const data = await postSubmitComment({ postID: post._id, message });
    if (data.success === 1) {
      setCommentText('');
      const {
        comment: { user: newCommentUser, ...commentRest },
      } = data.content;
      setComments((prev) => [
        {
          ...commentRest,
          likes: 0,
          liked: false,
          user: { ...newCommentUser, profilePicture: user.profilePicture },
        },
        ...prev,
      ]);
      setCommentCount((prev) => prev + 1);
    } else {
      dispatch(
        dispatchSnackbar({
          mode: 'error',
          message:
            'Something went wrong while submitting your comment. Please try again',
        })
      );
    }
  }, [commentText, post]);

  async function handleDeletePost() {
    setMenuAnchorEl(undefined);
    if (
      window.confirm(
        'Are you sure you want to delete this post? This action cannot be undone.'
      )
    ) {
      const data = await deletePost({ postID: post._id });
      if (data.success === 1) {
        setIsDeleted(true);
        dispatch(
          dispatchSnackbar({ message: 'Successfully deleted post', mode: 'notify' })
        );
      } else {
        dispatch(
          dispatchSnackbar({
            message: 'There was an error trying to delete this post',
            mode: 'error',
          })
        );
      }
    }
  }

  const handleCopy = async () => {
    setMenuAnchorEl(undefined);
    await navigator.clipboard.writeText(`https://rootshare.io/post/${post._id}`);
    dispatch(dispatchSnackbar({ mode: 'notify', message: 'Copied post link!' }));
  };

  return isDeleted ? (
    <></>
  ) : (
    <RSCard
      variant="secondary"
      style={{ paddingTop: 20, paddingBottom: 20, ...style }}
      className={[className, styles.wrapper].join(' ')}
    >
      {showLikesModal ? (
        <LikesModal
          open={showLikesModal}
          onClose={() => setShowLikesModal(false)}
          postID={post._id}
        />
      ) : (
        <></>
      )}
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
          <RSLink href={anonymousCleanedData?.posterNavigationURL} underline="hover">
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
                src={anonymousCleanedData?.posterProfilePicture}
                style={{ height: 65, width: 65 }}
              />
            </div>
          </RSLink>
          <div id="name-and-info" style={{ textAlign: 'left', marginLeft: 15 }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {pinned && (
                <RiPushpin2Fill
                  color={Theme.secondaryText}
                  size={18}
                  style={{ marginRight: 5 }}
                />
              )}
              <RSLink
                href={anonymousCleanedData?.posterNavigationURL}
                underline="hover"
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
                  <RSText bold>{anonymousCleanedData?.posterName}</RSText>
                </div>
              </RSLink>
              {post.toCommunity?._id && !options?.hideToCommunity && (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <img
                    src={RightArrow}
                    style={{ marginLeft: 15, marginRight: 15, height: 12 }}
                    alt="to"
                  />
                  <RSLink
                    href={anonymousCleanedData?.toEntityNavigationURL}
                    underline="hover"
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
              {formatPostTime(post.createdAt)}
            </RSText>
          </div>
        </div>
        <IconButton
          style={{ height: '100%' }}
          onClick={(e) => setMenuAnchorEl(e.currentTarget)}
        >
          <FaEllipsisH size={20} />
        </IconButton>
        <Menu
          open={Boolean(menuAnchorEl)}
          anchorEl={menuAnchorEl}
          onClose={() => setMenuAnchorEl(undefined)}
        >
          {options?.pinToCommunityMenuItem?.value && (
            <MenuItem
              onClick={async () => {
                setMenuAnchorEl(undefined);
                setPinned((prev) => !prev);
                const success = await options?.pinToCommunityMenuItem?.onPin(
                  post._id
                );
                if (!success) setPinned((prev) => !prev);
              }}
              className={styles.menuItem}
            >
              <RiPushpin2Line color={Theme.secondaryText} size={18} />
              <RSText color={Theme.secondaryText} style={{ marginLeft: 5 }}>
                {pinned ? 'Unpin' : 'Pin'}
              </RSText>
            </MenuItem>
          )}
          <MenuItem className={styles.menuItem} onClick={handleCopy}>
            <IoCopyOutline color={Theme.secondaryText} size={15} />
            <RSText color={Theme.secondaryText} style={{ marginLeft: 5 }}>
              Copy Link
            </RSText>
          </MenuItem>
          {post.user._id === user._id && (
            <MenuItem onClick={handleDeletePost} className={styles.menuItem}>
              <IoTrashBinOutline color={Theme.secondaryText} size={15} />
              <RSText color={Theme.secondaryText} style={{ marginLeft: 5 }}>
                Delete
              </RSText>
            </MenuItem>
          )}
          <MenuItem
            onClick={() => {
              setMenuAnchorEl(undefined);
              window.alert('This feature is still under development');
            }}
            className={styles.menuItem}
          >
            <MdReportProblem color={Theme.error} size={15} />
            <RSText color={Theme.error} style={{ marginLeft: 5 }}>
              Report
            </RSText>
          </MenuItem>
        </Menu>
      </div>
      <RSText
        style={{
          marginLeft: 30,
          marginRight: 30,
          marginTop: 10,
          marginBottom: 15,
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
          className={styles.image}
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
        <RSText
          color={Theme.secondaryText}
          className={styles.likes}
          size={11}
          onClick={() => setShowLikesModal(true)}
          bold
        >
          {likeCount} Sprouts
        </RSText>
        <RSText
          color={Theme.secondaryText}
          className={styles.likes}
          style={{ marginLeft: 33 }}
          onClick={handleCommentTextClick}
          size={11}
          bold
        >
          {commentCount} Comment{commentCount !== 1 ? 's' : ''}
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
          variant="text"
          onClick={() => handleSproutClick(!liked)}
          disabled={likeDisabled}
          style={{ textTransform: 'none' }}
        >
          <div
            style={{
              display: 'flex',
              width: '100%',
              height: '100%',
              alignItems: 'center',
            }}
          >
            <FaLeaf color={liked ? Theme.bright : Theme.secondaryText} size={20} />
            <RSText color={Theme.secondaryText} style={{ marginLeft: 10 }}>
              Sprout
            </RSText>
          </div>
        </DynamicIconButton>
        <Button
          variant="text"
          onClick={handleCommentIconClick}
          style={{ textTransform: 'none' }}
        >
          <div
            style={{
              display: 'flex',
              width: '100%',
              height: '100%',
              alignItems: 'center',
            }}
          >
            <FaRegComment size={20} />
            <RSText color={Theme.secondaryText} style={{ marginLeft: 10 }}>
              Comment
            </RSText>
          </div>
        </Button>
      </div>

      {showCommentField ? (
        <div
          style={{
            marginLeft: 20,
            marginRight: 20,
            marginBottom: 10,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <RSTextField
            label={'Add a comment...'}
            variant="outlined"
            fullWidth
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            error={Boolean(commentErr)}
            helperText={commentErr}
          />
          <DynamicIconButton onClick={submitComment} style={{ height: '100%' }}>
            <MdSend size={22} color={Theme.bright} />
          </DynamicIconButton>
        </div>
      ) : (
        <></>
      )}

      {showComments ? (
        <div id="comments">
          {comments.map((comment, idx) => (
            <Comment
              comment={comment}
              style={{ marginTop: idx !== 0 ? 10 : undefined }}
            />
          ))}

          {comments.length !== commentCount && !loadingComments ? (
            <RSText
              className={styles.likes}
              style={{ textAlign: 'left', marginLeft: 20, marginRight: 20 }}
              color={Theme.secondaryText}
              onClick={() => fetchComments({ fromLastComment: true })}
            >
              Load More Comments
            </RSText>
          ) : (
            <></>
          )}
        </div>
      ) : (
        <></>
      )}
      {loadingComments ? (
        <CircularProgress size={40} style={{ color: Theme.bright, marginTop: 15 }} />
      ) : (
        <></>
      )}
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

export const formatPostTime = (timestamp: string) =>
  dayjs(timestamp).format(
    `MMM D${
      new Date().getFullYear() !== new Date(timestamp).getFullYear() ? ' YYYY' : ''
    }, h:mm a`
  );
