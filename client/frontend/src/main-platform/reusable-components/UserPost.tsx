import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { CaiteHeadshot } from '../../images/team';
import RSText from '../../base-components/RSText';
import { colors } from '../../theme/Colors';

import { GiTreeBranch } from 'react-icons/gi';
import { BsStar, BsStarFill } from 'react-icons/bs';
import { Button, TextField, IconButton } from '@material-ui/core';

const MAX_INITIAL_VISIBLE_CHARS = 200;

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    background: colors.secondary,
    borderRadius: 10,
    marginLeft: 20,
    marginRight: 20,
    padding: 1,
    paddingLeft: 20,
    paddingRight: 20,
    marginTop: 5,
  },
  top: {
    display: 'flex',
    justifyContent: 'flex-start',
    marginTop: 15,
    marginBottom: 10,
  },
  profilePic: {
    height: 50,
    borderRadius: 60,
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
  },
  noUnderline: {
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'none',
    },
  },
  message: {
    textAlign: 'left',
    marginLeft: 10,
    marginRight: 10,
  },
  messageBody: {
    lineHeight: 1.3,
  },
  seeMoreButton: {
    color: colors.secondaryText,
  },
  seeMoreButtonDiv: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  likesAndCommentsContainer: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
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
  likeShareButtonContainer: {
    display: 'flex',
    justifyContent: 'flex-start',
  },
}));

type Props = {};

function UserPost(props: Props) {
  const styles = useStyles();
  const [showFullMessage, setShowFullMessage] = useState(false);
  const [liked, setLiked] = useState(false);

  const [likeCount, setLikeCount] = useState(104);

  const message =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque semper nisi sit amet ex tempor, non congue ex molestie. Sed et nulla mauris. In hac habitasse platea dictumst. Nullam ornare tellus bibendum enim volutpat fermentum. Nullam vulputate laoreet tristique. Nam a nibh eget tortor pulvinar placerat. Cras gravida scelerisque odio in vestibulum. Nunc id augue tortor. Aliquam faucibus facilisis tortor nec accumsan. Proin sed tincidunt purus. Praesent tempor nisl enim, et ornare arcu turpis.';
  const shortenedMessage = message.substr(0, MAX_INITIAL_VISIBLE_CHARS);

  function handleShowMoreClick() {
    setShowFullMessage(!showFullMessage);
  }

  function handleLikeStatusChange() {
    const oldLiked = liked;
    if (oldLiked) setLikeCount(likeCount - 1);
    else setLikeCount(likeCount + 1);

    setLiked(!oldLiked);
  }

  function renderPostHeader() {
    return (
      <div className={styles.top}>
        <a href="/profile/user_id" className={styles.noUnderline}>
          <img src={CaiteHeadshot} className={styles.profilePic} />
        </a>

        <div className={styles.postHeadText}>
          <div className={styles.nameAndOrgDiv}>
            <a href="/profile/user_id" className={styles.noUnderline}>
              <RSText type="subhead" color={colors.primaryText} bold size={14}>
                Caite Capezzuto
              </RSText>
            </a>

            <GiTreeBranch
              color={colors.primaryText}
              size={16}
              className={styles.plantIcon}
            />
            <a href="/community/orgID" className={styles.noUnderline}>
              <RSText type="subhead" color={colors.primaryText} bold size={14}>
                Alpha Xi Delta
              </RSText>
            </a>
          </div>
          <RSText type="subhead" color={colors.secondaryText} size={12} italic>
            June 23, 2020 7:45 PM
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
          {!showFullMessage && shortenedMessage !== message
            ? shortenedMessage.concat('  ...')
            : message}
        </RSText>
        <div className={styles.seeMoreButtonDiv}>
          <Button className={styles.seeMoreButton} onClick={handleShowMoreClick}>
            See {showFullMessage ? 'less' : 'more'}
          </Button>
        </div>
      </div>
    );
  }

  function renderLikesAndCommentCount() {
    return (
      <div className={styles.likesAndCommentsContainer}>
        <IconButton onClick={handleLikeStatusChange}>
          {liked ? (
            <BsStarFill size={25} color={colors.bright} />
          ) : (
            <BsStar size={25} color={colors.bright} />
          )}
        </IconButton>

        <RSText type="body" color={colors.secondaryText} size={12}>
          {likeCount} Likes
        </RSText>
        <a href={undefined} className={styles.commentCountLink}>
          <RSText
            type="body"
            color={colors.secondaryText}
            size={12}
            className={styles.commentCount}
          >
            102 Comments
          </RSText>
        </a>
      </div>
    );
  }

  function renderLikeShareButtons() {
    return (
      <div className={styles.likeShareButtonContainer}>
        <Button size="large" variant="contained">
          <BsStar size={22} color={colors.bright} />
          <span style={{ marginRight: 10 }} />
          Like
        </Button>
      </div>
    );
  }
  return (
    <div className={styles.wrapper}>
      {renderPostHeader()}
      {renderMessage()}
      {renderLikesAndCommentCount()}
      {/* {renderLikeShareButtons()} */}
      {}
    </div>
  );
}

export default UserPost;