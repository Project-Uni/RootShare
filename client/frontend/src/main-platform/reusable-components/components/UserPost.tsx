import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Button,
  TextField,
  IconButton,
  CircularProgress,
  Box,
} from '@material-ui/core';

import { connect } from 'react-redux';
import qs from 'query-string';

import { GiTreeBranch } from 'react-icons/gi';
import { BsStar, BsStarFill } from 'react-icons/bs';
import { MdSend } from 'react-icons/md';

import { Comment } from '../';
import { CaiteHeadshot } from '../../../images/team';
import RSText from '../../../base-components/RSText';
import { colors } from '../../../theme/Colors';
import ProfilePicture from '../../../base-components/ProfilePicture';
import { formatDatePretty, formatTime, makeRequest } from '../../../helpers/functions';

const MAX_INITIAL_VISIBLE_CHARS = 200;

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    background: colors.primaryText,
    borderRadius: 10,
    padding: 1,
    paddingLeft: 20,
    paddingRight: 20,
  },
  top: {
    display: 'flex',
    justifyContent: 'flex-start',
    marginTop: 20,
    marginBottom: 10,
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
  noUnderline: {
    color: 'inherit',
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  message: {
    textAlign: 'left',
    marginLeft: 55,
    marginRight: 10,
  },
  messageBody: {
    lineHeight: 1.3,
  },
  seeMoreButton: {
    color: colors.secondaryText,
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
    '&:hover': {
      textDecoration: 'underline',
      cursor: 'pointer',
    },
  },
  commentCountLink: {
    marginLeft: 20,
  },
  commentProfile: {
    border: `1px solid ${colors.fourth}`,
  },
  leaveCommentContainer: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 15,
  },
  commentsContainer: {
    borderTop: `1px solid ${colors.fourth}`,
    borderBottom: `1px solid ${colors.fourth}`,
    marginBottom: 15,
  },
  loadingIndicator: {
    color: colors.secondaryText,
    marginTop: 8,
    marginBottom: 8,
  },
}));

const useTextFieldStyles = makeStyles((_: any) => ({
  commentTextField: {
    flex: 1,
    marginLeft: 15,
    width: '100%',
    background: colors.primaryText,
    borderRadius: 10,
    [`& fieldset`]: {
      borderRadius: 10,
    },
  },
}));

type Props = {
  postID: string;
  _id: string;
  name: string;
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
  user: { [ key: string ]: any }
  accessToken: string;
  refreshToken: string;
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
    }
    updatedAt: string;
}

function UserPost(props: Props) {
  const styles = useStyles();
  const textFieldStyles = useTextFieldStyles();

  const [showFullMessage, setShowFullMessage] = useState(false);
  const [liked, setLiked] = useState(props.liked);
  const [likeCount, setLikeCount] = useState(props.likeCount);
  const [comment, setComment] = useState('');
  const [earliestComment, setEarliestComment] = useState(new Date());
  const [showComments, setShowComments] = useState(false);
  //const [comments, setComments] = useState<{ [key: string]: any }>([]);
  const [comments, setComments] = useState<JSX.Element[]>([]);
  const [loadingMoreComments, setLoadingMoreComments] = useState(false);

  const [commentErr, setCommentErr] = useState('');
  const [likeDisabled, setLikeDisabled] = useState(false);

  const shortenedMessage = props.message.substr(0, MAX_INITIAL_VISIBLE_CHARS);

  function handleShowMoreClick() {
    setShowFullMessage(!showFullMessage);
  }

  async function likePost() {
    setLikeDisabled(true);
    const { data } = await makeRequest('POST', `/api/posts/action/${props.postID}/like`, {}, true, props.accessToken, props.refreshToken);
    if(data.success === 1) {
      setLiked(true);
      setLikeCount(likeCount + 1)
    }
    setLikeDisabled(false)
  }

  async function unlikePost() {
    setLikeDisabled(true);
    const { data } = await makeRequest('POST', `/api/posts/action/${props.postID}/unlike`, {}, true, props.accessToken, props.refreshToken);
    if(data.success === 1) {
      setLiked(false);
      setLikeCount(likeCount - 1)
    }
    setLikeDisabled(false)
  }

  async function handleSendComment() {
    const cleanedComment = comment.trim();
    if (cleanedComment.length === 0) {
      setCommentErr('Please enter a comment.');
      return;
    } else {
      setCommentErr('');
    }

    const message = comment
    const { data } = await makeRequest(
        'POST',
        `/api/posts/comment/new/${props.postID}`,
        { message },
        true,
        props.accessToken,
        props.refreshToken
    );

    if (data.success === 1){
        setComment('')
        const newComment = generateComments([data.content.comment])
        setComments((prevComments)=>{
            const newComment =
            <Comment
                userID={props.user._id}
                name={`${props.user.firstName} ${props.user.lastName}`}
                timestamp={`${formatDatePretty(new Date(data.content.comment.createdAt))} at ${formatTime(
                    new Date(data.content.comment.createdAt)
                )}`}
                profilePicture={props.user.profilePicture}
                message={data.content.comment.message}
            />
            return prevComments.concat(newComment)
        })
        console.log(data)
    }

  }

  async function handleRetrieveComments() {
    const query = qs.stringify({from: new Date()})
    const { data } = await makeRequest(
        'GET',
        `/api/posts/comments/${props.postID}?${query}`,
        {},
        true,
        props.accessToken,
        props.refreshToken
    );

    if (data.success == 1){
        if (data.content['comments'].length > 0) setEarliestComment(new Date(data.content['comments'][0].createdAt))
        setComments(generateComments(data.content['comments'].reverse()))
    }
    console.log(data)

  }

  async function handleMoreCommentsClick() {

    const query = qs.stringify({from: new Date(earliestComment)})
    const { data } = await makeRequest(
        'GET',
        `/api/posts/comments/${props.postID}?${query}`,
        {},
        true,
        props.accessToken,
        props.refreshToken
    );

    if (data.success == 1){
        setComments([...generateComments(data.content['comments'].reverse()), ...comments])
    }
  }

  function renderPostHeader() {
    return (
      <div className={styles.top}>
        <a
          href={`/${props.anonymous ? 'community' : 'profile'}/${props._id}`}
          className={styles.noUnderline}
        >
          <ProfilePicture
            height={50}
            width={50}
            borderRadius={50}
            className={styles.profilePicContainer}
            type="profile"
            currentPicture={props.profilePicture}
          />
        </a>

        <div className={styles.postHeadText}>
          <div className={styles.nameAndOrgDiv}>
            <a
              href={`/${props.anonymous ? 'community' : 'profile'}/${props._id}`}
              className={styles.noUnderline}
            >
              <RSText type="subhead" color={colors.secondary} bold size={14}>
                {props.name}
              </RSText>
            </a>

            {props.toCommunity && (
              <>
                <GiTreeBranch
                  color={colors.secondary}
                  size={16}
                  className={styles.plantIcon}
                />
                <a
                  href={`/community/${props.toCommunityID}`}
                  className={styles.noUnderline}
                >
                  <RSText type="subhead" color={colors.secondary} bold size={14}>
                    {props.toCommunity}
                  </RSText>
                </a>
              </>
            )}
          </div>
          <RSText type="subhead" color={colors.secondaryText} size={12}>
            {props.timestamp}
          </RSText>
        </div>
      </div>
    );
  }

  function renderMessage() {
    return (
      <div className={styles.message}>
        <RSText
          type="body"
          color={colors.secondary}
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
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={liked ? unlikePost : likePost} disabled={likeDisabled}>
            {liked ? (
              <BsStarFill size={20} color={colors.bright} />
            ) : (
              <BsStar size={20} color={colors.secondaryText} />
            )}
          </IconButton>

          <RSText type="body" color={colors.secondaryText} size={12}>
            {likeCount} Likes
          </RSText>
          <a
            href={undefined}
            className={styles.commentCountLink}
            onClick={() => setShowComments(!showComments)}
          >
              <a onClick={handleRetrieveComments}>
                  <RSText
                      type="body"
                      color={colors.secondaryText}
                      size={12}
                      className={styles.commentCount}
                  >
                      {props.commentCount} Comments
                  </RSText>
              </a>
          </a>
        </div>

        <Button className={styles.seeMoreButton} onClick={handleShowMoreClick}>
          See {showFullMessage ? 'less' : 'more'}
        </Button>
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
        />
        <TextField
          variant="outlined"
          value={comment}
          placeholder="Leave a comment..."
          onChange={(event: any) => setComment(event.target.value)}
          className={textFieldStyles.commentTextField}
          multiline
          error={commentErr !== ''}
          helperText={commentErr}
        />
        <IconButton onClick={handleSendComment}>
          <MdSend size={22} color={colors.bright} />
        </IconButton>
      </div>
    );
  }

  function generateComments(commentsList: CommentResponse[]) {
    const output = [];
    console.log("CommentsList:", commentsList)
    for(let i=0; i<commentsList.length; i++) {
      output.push(
        <Comment
          userID={commentsList[i].user._id}
          name={`${commentsList[i].user.firstName} ${commentsList[i].user.lastName}`}
          timestamp={`${formatDatePretty(new Date(commentsList[i].createdAt))} at ${formatTime(
            new Date(commentsList[i].createdAt)
          )}`}
          message={commentsList[i].message}
          profilePicture={commentsList[i].user.profilePicture}
        />
      );

    }

    return output;
  }

  /*
     function renderComments() {
    const output = [];
    for (let i = 0; i < comments.length; i++)
      output.push(
        <Comment
          userID={comments[i].user._id}
          name={`${comments[i].user.firstName} ${comments[i].user.lastName}`}
          timestamp={`${formatDatePretty(new Date(comments[i].createdAt))} at ${formatTime(
            new Date(comments[i].createdAt)
          )}`}
          message={comments[i].message}
          profilePicture={comments[i].user.profilePicture}
        />
      );
    return (
      <div className={styles.commentsContainer}>
        <div>
          {output}
          <Button className={styles.seeMoreButton} onClick={handleMoreCommentsClick}>
            More Comments
          </Button>
        </div>
        {loadingMoreComments && (
          <CircularProgress size={40} className={styles.loadingIndicator} />
        )}
      </div>
    );
  }
   */

  return (
    <Box borderRadius={10} boxShadow={2} className={props.style || null}>
      <div className={styles.wrapper}>
        {renderPostHeader()}
        {renderMessage()}
        {renderLikesAndCommentCount()}
        {showComments && (
          <div className={styles.commentsContainer}>
              <Button className={styles.seeMoreButton} onClick={handleMoreCommentsClick}>
                Show Previous Comments
              </Button>
            <div>
              {comments}

            </div>
            {loadingMoreComments && (
              <CircularProgress size={40} className={styles.loadingIndicator} />
            )}
          </div>
          )}
        {renderLeaveCommentArea()}
      </div>
    </Box>
  );
}

const mapStateToProps = (state: { [key: string]: any }) => {
  return {
    user: state.user,
    accessToken: state.accessToken,
    refreshToken: state.refreshToken,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(UserPost);
