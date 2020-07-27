import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Button, TextField, IconButton, CircularProgress } from '@material-ui/core';

import { GiTreeBranch } from 'react-icons/gi';
import { BsStar, BsStarFill } from 'react-icons/bs';
import { MdSend } from 'react-icons/md';

import { Comment } from '../';
import { CaiteHeadshot } from '../../../images/team';
import RSText from '../../../base-components/RSText';
import { colors } from '../../../theme/Colors';

const MAX_INITIAL_VISIBLE_CHARS = 200;

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    background: colors.secondary,
    borderRadius: 1,
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
  profilePic: {
    height: 50,
    borderRadius: 60,
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
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'none',
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
    height: 40,
    borderRadius: 40,
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
  userID: string;
  userName: string;
  community?: string;
  communityID?: string;
  timestamp: string;
  profilePicture: any;
  message: string;
  likeCount: number;
  commentCount: number;
  style?: any;
};

function UserPost(props: Props) {
  const styles = useStyles();
  const textFieldStyles = useTextFieldStyles();

  const [showFullMessage, setShowFullMessage] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(props.likeCount);
  const [comment, setComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [loadingMoreComments, setLoadingMoreComments] = useState(false);

  const shortenedMessage = props.message.substr(0, MAX_INITIAL_VISIBLE_CHARS);

  function handleShowMoreClick() {
    setShowFullMessage(!showFullMessage);
  }

  function handleLikeStatusChange() {
    const oldLiked = liked;
    if (oldLiked) setLikeCount(likeCount - 1);
    else setLikeCount(likeCount + 1);

    setLiked(!oldLiked);
  }

  function handleSendComment() {
    console.log('Comment:', comment);
  }

  function handleMoreCommentsClick() {
    setLoadingMoreComments(true);
    setTimeout(() => {
      setLoadingMoreComments(false);
    }, 1500);
  }

  function renderPostHeader() {
    return (
      <div className={styles.top}>
        <a href={`/profile/${props.userID}`} className={styles.noUnderline}>
          <img src={props.profilePicture} className={styles.profilePic} />
        </a>

        <div className={styles.postHeadText}>
          <div className={styles.nameAndOrgDiv}>
            <a href={`/profile/${props.userID}`} className={styles.noUnderline}>
              <RSText type="subhead" color={colors.primaryText} bold size={14}>
                {props.userName}
              </RSText>
            </a>

            {props.community && (
              <>
                <GiTreeBranch
                  color={colors.primaryText}
                  size={16}
                  className={styles.plantIcon}
                />
                <a
                  href={`/community/${props.communityID}`}
                  className={styles.noUnderline}
                >
                  <RSText type="subhead" color={colors.primaryText} bold size={14}>
                    {props.community}
                  </RSText>
                </a>
              </>
            )}
          </div>
          <RSText type="subhead" color={colors.secondaryText} size={12} >
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
          color={colors.primaryText}
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
          <IconButton onClick={handleLikeStatusChange}>
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
            <RSText
              type="body"
              color={colors.secondaryText}
              size={12}
              className={styles.commentCount}
            >
              {props.commentCount} Comments
            </RSText>
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
        <img src={CaiteHeadshot} className={styles.commentProfile} />
        <TextField
          variant="outlined"
          value={comment}
          placeholder="Leave a comment..."
          onChange={(event: any) => setComment(event.target.value)}
          className={textFieldStyles.commentTextField}
          multiline
        />
        <IconButton onClick={handleSendComment}>
          <MdSend size={22} color={colors.bright} />
        </IconButton>
      </div>
    );
  }

  function renderComments() {
    const output = [];
    for (let i = 0; i < 5; i++)
      output.push(
        <Comment
          userID="ABCD_TEST_123"
          name="Caite Capezzuto"
          timestamp="July 11, 2020 7:45 PM"
          message="Hello! Sign up for RootShare! New Hampshire is the best state! TOPANGA!!"
          profilePicture={CaiteHeadshot}
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

  return (
    <div className={[styles.wrapper, props.style || null].join(' ')}>
      {renderPostHeader()}
      {renderMessage()}
      {renderLikesAndCommentCount()}
      {showComments && renderComments()}
      {renderLeaveCommentArea()}
    </div>
  );
}

export default UserPost;
