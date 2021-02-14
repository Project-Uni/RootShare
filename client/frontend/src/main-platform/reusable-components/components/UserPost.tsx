import React, { useRef, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Button,
  TextField,
  IconButton,
  CircularProgress,
  Box,
  Menu,
  MenuItem,
} from '@material-ui/core';

import { connect, useDispatch } from 'react-redux';
import qs from 'query-string';

import { GiTreeBranch } from 'react-icons/gi';
import { BsStar, BsStarFill } from 'react-icons/bs';
import { MdSend } from 'react-icons/md';
import { FaEllipsisH } from 'react-icons/fa';
import CastForEducationIcon from '@material-ui/icons/CastForEducation';

import Carousel, { Modal, ModalGateway } from 'react-images';

import { Comment, RSLink } from '../';
import { RSText, ProfilePicture, DynamicIconButton } from '../../../base-components';
import {
  formatDatePretty,
  formatTime,
  makeRequest,
} from '../../../helpers/functions';

import LikesModal from './LikesModal';
import Theme from '../../../theme/Theme';

import {
  dispatchHoverPreview,
  dispatchSnackbar,
  hoverPreviewTriggerComponentExit,
} from '../../../redux/actions/interactions';
import { putLikeStatus } from '../../../api/put/putLikeStatus';

const MAX_INITIAL_VISIBLE_CHARS = 200;

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    background: Theme.white,
    borderRadius: 10,
    padding: 1,
  },
  rest: {
    paddingLeft: 20,
    paddingRight: 20,
  },
  top: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 10,
    paddingLeft: 20,
    paddingRight: 20,
  },
  profilePicContainer: {
    marginLeft: -6,
  },
  postHeadText: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    marginLeft: 10,
    textAlign: 'left',
  },
  nameAndOrgDiv: {
    display: 'flex',
    justifyContent: 'flex-start',
  },
  plantIcon: {
    marginLeft: 15,
    marginRight: 15,
    marginBottom: -4,
    marginTop: 4,
  },
  broadcastIcon: {
    marginLeft: 8,
    marginBottom: 5,
  },
  noUnderline: {
    color: 'inherit',
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
      cursor: 'pointer',
    },
  },
  message: {
    textAlign: 'left',
    marginLeft: 55,
    marginRight: 10,
    marginTop: 10,
  },
  messageBody: {
    lineHeight: 1.3,
  },
  seeMoreButton: {
    color: Theme.secondaryText,
    marginRight: 38,
  },
  seeMoreButtonDiv: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginRight: 20,
  },
  likesAndCommentsContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 43,
  },
  commentCount: {
    marginLeft: 20,
  },
  commentCountLink: {
    '&:hover': {
      textDecoration: 'underline',
      cursor: 'pointer',
    },
  },
  commentProfile: {
    border: `1px solid ${Theme.primaryText}`,
  },
  leaveCommentContainer: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 15,
  },
  commentsContainer: {
    marginBottom: 15,
  },
  loadingIndicator: {
    color: Theme.secondaryText,
    marginTop: 8,
    marginBottom: 8,
  },
  likes: {
    '&:hover': {
      textDecoration: 'underline',
      cursor: 'pointer',
    },
    zIndex: 2,
  },
  imagePreviewWrapper: {
    width: '100%',
    background: `linear-gradient(90deg, rgb(107, 107, 107), rgb(20, 20, 20), rgb(107, 107, 107));`,
  },
  previewImage: {
    maxHeight: 300,
    '&:hover': {
      cursor: 'pointer',
    },
    maxWidth: '100%',
    objectFit: 'contain',
  },
  deleted: {
    display: 'none',
  },
}));

const useTextFieldStyles = makeStyles((_: any) => ({
  commentTextField: {
    flex: 1,
    marginLeft: 15,
    width: '100%',
    borderRadius: 10,
    [`& fieldset`]: {
      borderRadius: 10,
    },
  },
}));

type Props = {
  postID: string;
  posterID: string;
  isOwnPost?: boolean;
  name: string;
  type?: string;
  toCommunity?: string;
  toCommunityID?: string;
  timestamp: string;
  profilePicture: any;
  message: string;
  likeCount: number;
  commentCount: number;
  style?: any;
  anonymous?: boolean;
  liked?: boolean;
  user: { [key: string]: any };
  images?: { fileName: string }[];
};

type CommentResponse = {
  createdAt: string;
  _id: string;
  message: string;
  user: {
    firstName: string;
    lastName: string;
    _id: string;
    profilePicture?: string;
  };
  updatedAt: string;
};

function UserPost(props: Props) {
  const styles = useStyles();
  const textFieldStyles = useTextFieldStyles();

  const dispatch = useDispatch();

  const [showFullMessage, setShowFullMessage] = useState(false);
  const [liked, setLiked] = useState(props.liked);
  const [likeCount, setLikeCount] = useState(props.likeCount);
  const [commentCount, setCommentCount] = useState(props.commentCount);

  const [comment, setComment] = useState('');
  const [earliestComment, setEarliestComment] = useState(new Date());
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<JSX.Element[]>([]);
  const [loadingMoreComments, setLoadingMoreComments] = useState(false);
  const [initialCommentsLoaded, setInitialCommentsLoaded] = useState(false);

  const [commentErr, setCommentErr] = useState('');
  const [likeDisabled, setLikeDisabled] = useState(false);
  const [showLikesModal, setShowLikesModal] = useState(false);

  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);

  const [isDeleted, setIsDeleted] = useState(false);
  const [showDeletedMessage, setShowDeletedMessage] = useState(false);

  const shortenedMessage = props.message.substr(0, MAX_INITIAL_VISIBLE_CHARS);

  const isHovering = useRef(false);

  function handleShowMoreClick() {
    setShowFullMessage(!showFullMessage);
  }

  async function likePost() {
    setLikeDisabled(true);
    const data = await putLikeStatus(props.postID, 'like');
    if (data.success === 1) {
      setLiked(true);
      setLikeCount(likeCount + 1);
    }
    setLikeDisabled(false);
  }

  async function unlikePost() {
    setLikeDisabled(true);
    const data = await putLikeStatus(props.postID, 'unlike');
    if (data.success === 1) {
      setLiked(false);
      setLikeCount(likeCount - 1);
    }
    setLikeDisabled(false);
  }

  function handleShowComments() {
    if (props.commentCount === 0) return;

    if (comments.length > 0 && !initialCommentsLoaded) setShowComments(true);
    else setShowComments(!showComments);

    if (!initialCommentsLoaded) {
      handleRetrieveComments();
      setInitialCommentsLoaded(true);
    }
  }

  async function handleSendComment() {
    const cleanedComment = comment.trim();
    if (cleanedComment.length === 0) {
      setCommentErr('Please enter a comment.');
      return;
    } else {
      setCommentErr('');
    }

    const message = comment;
    const { data } = await makeRequest(
      'POST',
      `/api/posts/comment/new/${props.postID}`,
      { message }
    );

    if (data.success === 1) {
      setComment('');
      setCommentCount(commentCount + 1);
      const newComment = generateComments([data.content.comment]);
      setComments((prevComments) => {
        const newComment = (
          <Comment
            userID={props.user._id}
            name={`${props.user.firstName} ${props.user.lastName}`}
            timestamp={`${formatDatePretty(
              new Date(data.content.comment.createdAt)
            )} at ${formatTime(new Date(data.content.comment.createdAt))}`}
            profilePicture={props.user.profilePicture}
            message={data.content.comment.message}
          />
        );
        return prevComments.concat(newComment);
      });
      if (!showComments) setShowComments(true);
    }
  }

  async function handleRetrieveComments() {
    setLoadingMoreComments(true);
    const { data } = await makeRequest('GET', `/api/posts/comments/${props.postID}`);

    if (data.success == 1) {
      if (data.content['comments'].length > 0)
        setEarliestComment(
          new Date(
            data.content['comments'][data.content.comments.length - 1].createdAt
          )
        );
      setComments(generateComments(data.content['comments'].reverse()));
    }
    setLoadingMoreComments(false);
  }

  async function handleMoreCommentsClick() {
    setLoadingMoreComments(true);
    const query = qs.stringify({ from: earliestComment });
    const { data } = await makeRequest(
      'GET',
      `/api/posts/comments/${props.postID}?${query}`
    );

    if (data.success == 1) {
      if (data.content['comments'].length > 0)
        setEarliestComment(
          new Date(data.content.comments[data.content.comments.length - 1].createdAt)
        );
      setComments([
        ...generateComments(data.content['comments'].reverse()),
        ...comments,
      ]);
    }
    setLoadingMoreComments(false);
  }

  async function handleDeleteClicked() {
    setMenuAnchorEl(null);
    if (
      window.confirm(
        'Are you sure you want to delete this post? This action cannot be undone.'
      )
    ) {
      const { data } = await makeRequest(
        'DELETE',
        `/api/posts/delete/${props.postID}`
      );
      if (data.success === 1) {
        setIsDeleted(true);
        setShowDeletedMessage(true);
        setTimeout(() => setShowDeletedMessage(false), 5000);
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

  const handleMouseOver = (e: React.MouseEvent<HTMLElement>) => {
    isHovering.current = true;
    const currentTarget = e.currentTarget;
    setTimeout(() => {
      if (isHovering.current)
        dispatch(
          dispatchHoverPreview({
            _id: props.posterID,
            type: props.anonymous ? 'community' : 'user',
            profilePicture: props.profilePicture,
            name: props.name,
            anchorEl: currentTarget,
          })
        );
    }, 300);
  };

  function renderPostHeader() {
    return (
      <div className={styles.top}>
        <div style={{ display: 'flex' }}>
          <RSLink
            href={`/${props.anonymous ? 'community' : 'profile'}/${props.posterID}`}
          >
            <ProfilePicture
              height={50}
              width={50}
              borderRadius={50}
              className={styles.profilePicContainer}
              type="profile"
              currentPicture={props.profilePicture}
            />
          </RSLink>

          <div className={styles.postHeadText}>
            <div className={styles.nameAndOrgDiv}>
              <RSLink
                href={`/${props.anonymous ? 'community' : 'profile'}/${
                  props.posterID
                }`}
                className={styles.noUnderline}
              >
                <div
                  onMouseEnter={handleMouseOver}
                  onMouseLeave={() => {
                    isHovering.current = false;
                    setTimeout(() => {
                      dispatch(hoverPreviewTriggerComponentExit());
                    }, 500);
                  }}
                >
                  <RSText type="subhead" bold size={14}>
                    {props.name}
                  </RSText>
                </div>
              </RSLink>

              {props.toCommunity && (
                <>
                  <GiTreeBranch
                    color={Theme.secondaryText}
                    size={16}
                    className={styles.plantIcon}
                  />
                  <RSLink
                    href={`/community/${props.toCommunityID}`}
                    className={styles.noUnderline}
                  >
                    <RSText type="subhead" bold size={14}>
                      {props.toCommunity}
                    </RSText>
                  </RSLink>
                </>
              )}
              {props.type === 'broadcast' && (
                <CastForEducationIcon
                  color={'action'}
                  className={styles.broadcastIcon}
                />
              )}
            </div>
            <RSText type="subhead" color={Theme.secondaryText} size={12}>
              {props.timestamp}
            </RSText>
          </div>
        </div>
        {props.isOwnPost ? (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <IconButton
              style={{ height: 30 }}
              onClick={(event: any) => setMenuAnchorEl(event.currentTarget)}
            >
              <FaEllipsisH color={Theme.secondaryText} size={16} />
            </IconButton>
            <Menu
              open={Boolean(menuAnchorEl)}
              anchorEl={menuAnchorEl}
              onClose={() => setMenuAnchorEl(null)}
            >
              <MenuItem onClick={handleDeleteClicked}>
                <RSText color={Theme.error}>Delete</RSText>
              </MenuItem>
            </Menu>
          </div>
        ) : null}
      </div>
    );
  }

  function renderMessage() {
    return (
      <div className={styles.message}>
        <RSText
          type="body"
          color={Theme.primaryText}
          size={12}
          className={styles.messageBody}
        >
          {!showFullMessage && shortenedMessage !== props.message
            ? shortenedMessage.concat('  ...')
            : props.message}
        </RSText>
      </div>
    );
  }

  function renderLikesAndCommentCount() {
    return (
      <div className={styles.likesAndCommentsContainer}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
          }}
        >
          <DynamicIconButton
            onClick={liked ? unlikePost : likePost}
            disabled={likeDisabled}
          >
            {liked ? (
              <BsStarFill color={Theme.bright} size={24} />
            ) : (
              <BsStar color={Theme.bright} size={24} />
            )}
          </DynamicIconButton>

          <RSText
            type="body"
            color={Theme.secondaryText}
            size={12}
            className={styles.likes}
            onClick={() => {
              setShowLikesModal(true);
            }}
          >
            {likeCount} Likes
          </RSText>
          <RSText
            type="body"
            color={Theme.secondaryText}
            size={12}
            className={[styles.commentCount, styles.commentCountLink].join(' ')}
            onClick={commentCount > 0 ? handleShowComments : undefined}
          >
            {`${commentCount} ${commentCount === 1 ? 'Comment' : 'Comments'}`}
          </RSText>
        </div>

        {props.message.length !== shortenedMessage.length && (
          <Button className={styles.seeMoreButton} onClick={handleShowMoreClick}>
            See {showFullMessage ? 'less' : 'more'}
          </Button>
        )}
      </div>
    );
  }

  function renderLeaveCommentArea() {
    return (
      <div className={styles.leaveCommentContainer}>
        <ProfilePicture
          height={40}
          width={40}
          borderRadius={40}
          pictureStyle={styles.commentProfile}
          type="profile"
          currentPicture={props.user.profilePicture}
        />
        <TextField
          variant="outlined"
          value={comment}
          placeholder="Leave a comment..."
          onChange={(event: any) => setComment(event.target.value)}
          className={textFieldStyles.commentTextField}
          multiline
          error={commentErr !== ''}
        />
        <DynamicIconButton onClick={handleSendComment}>
          <MdSend size={22} color={Theme.bright} />
        </DynamicIconButton>
      </div>
    );
  }

  function renderDeletedMessage() {
    return showDeletedMessage ? (
      <div>
        <RSText color={Theme.success} italic>
          Successfully deleted post!
        </RSText>
      </div>
    ) : (
      <></>
    );
  }

  function generateComments(commentsList: CommentResponse[]) {
    const output = [];
    for (let i = 0; i < commentsList.length; i++) {
      output.push(
        <Comment
          userID={commentsList[i].user._id}
          name={`${commentsList[i].user.firstName} ${commentsList[i].user.lastName}`}
          timestamp={`${formatDatePretty(
            new Date(commentsList[i].createdAt)
          )} at ${formatTime(new Date(commentsList[i].createdAt))}`}
          message={commentsList[i].message}
          profilePicture={commentsList[i].user.profilePicture}
        />
      );
    }

    return output;
  }

  return (
    <>
      {renderDeletedMessage()}
      <Box
        borderRadius={10}
        boxShadow={2}
        className={[props.style || null, isDeleted ? styles.deleted : null].join(
          ' '
        )}
      >
        {showLikesModal && (
          <LikesModal
            open={showLikesModal}
            onClose={() => setShowLikesModal(false)}
            postID={props.postID}
          />
        )}

        <div className={styles.wrapper}>
          {renderPostHeader()}
          {props.images && props.images.length > 0 && (
            <div className={styles.imagePreviewWrapper}>
              <img
                className={styles.previewImage}
                src={props.images[0].fileName}
                onClick={() => setIsViewerOpen(true)}
              />
            </div>
          )}
          <div className={styles.rest}>
            {renderMessage()}
            {renderLikesAndCommentCount()}
            {showComments && (
              <div className={styles.commentsContainer}>
                {comments.length < props.commentCount && !loadingMoreComments && (
                  <Button
                    className={styles.seeMoreButton}
                    onClick={handleMoreCommentsClick}
                  >
                    Show Previous Comments
                  </Button>
                )}
                {loadingMoreComments && (
                  <div style={{ flex: 1 }}>
                    <CircularProgress
                      size={40}
                      className={styles.loadingIndicator}
                    />
                  </div>
                )}
                <div>{comments}</div>
              </div>
            )}
            {renderLeaveCommentArea()}
          </div>
        </div>
        <ModalGateway>
          {isViewerOpen && (
            <Modal onClose={() => setIsViewerOpen(false)}>
              <Carousel
                views={
                  props.images?.map((image) => ({ source: image.fileName })) || []
                }
              />
            </Modal>
          )}
        </ModalGateway>
      </Box>
    </>
  );
}

const mapStateToProps = (state: { [key: string]: any }) => {
  return {
    user: state.user,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(UserPost);
