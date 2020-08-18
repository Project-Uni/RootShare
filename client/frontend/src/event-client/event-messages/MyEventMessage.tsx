import React, { useState, useEffect } from 'react';
import { makeStyles, withStyles, Theme } from '@material-ui/core/styles';

import { Menu, MenuItem } from '@material-ui/core';
import { FaEllipsisH, FaRegStar, FaStar } from 'react-icons/fa';
import Tooltip from '@material-ui/core/Tooltip';

import { colors } from '../../theme/Colors';
import RSText from '../../base-components/RSText';

import { makeRequest, getConversationTime } from '../../helpers/functions';
import { MessageType } from '../../helpers/types';

const options = ['Connect with yourself?', 'Cancel'];

const ITEM_HEIGHT = 48;

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    background: colors.ternary,
    paddingBottom: 4,
    borderTopStyle: 'solid',
    borderWidth: '1px',
    borderColor: 'lightgray',
    display: 'flex',
  },
  errorWrapper: {
    background: colors.brightError,
    paddingBottom: 4,
    borderTopStyle: 'solid',
    borderWidth: '1px',
    borderColor: 'lightgray',
  },
  top: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  left: {
    flex: 1,
  },
  right: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 7,
  },
  senderName: {
    margin: 10,
    display: 'inline-block',
    color: colors.background,
    wordWrap: 'break-word',
    maxWidth: 240,
  },
  message: {
    textAlign: 'left',
    color: '#f2f2f2',
    marginLeft: 10,
    marginRight: 10,
    marginTop: 7,
    marginBottom: 10,
    wordWrap: 'break-word',
    maxWidth: 290,
  },
  bottom: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: -10,
  },
  likeCount: {
    color: '#f2f2f2',
  },
  star: {
    '&:hover': {
      color: colors.primaryText,
      cursor: 'pointer',
    },
    marginTop: -10,
    marginBottom: 3,
    color: '#6699ff',
  },
  starGray: {
    '&:hover': {
      color: colors.primaryText,
      cursor: 'pointer',
    },
    marginTop: -10,
    marginBottom: 3,
    color: 'grey',
  },
  time: {
    marginTop: 12,
    display: 'inline-block',
    color: 'grey',
  },
  ellipsis: {
    '&:hover': {
      color: colors.primaryText,
      cursor: 'pointer',
    },
    color: 'grey',
    marginBottom: 18,
    paddingRight: 1,
    visibility: 'hidden',
  },
}));

type Props = {
  message: MessageType;
  accessToken: string;
  refreshToken: string;
};

function MyEventMessage(props: Props) {
  const styles = useStyles();
  const [liked, setLiked] = useState(false);
  const [numLikes, setNumLikes] = useState(0);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [loadingLike, setLoadingLike] = useState(false);
  const open = Boolean(anchorEl);

  useEffect(() => {
    setLiked(props.message.liked);
  }, [props.message.liked]);

  useEffect(() => {
    setNumLikes(props.message.numLikes);
  }, [props.message.numLikes]);

  async function handleLikeClicked() {
    setLiked((prevVal) => {
      setNumLikes((prevNumLikes) => {
        if (prevVal) return prevNumLikes > 0 ? prevNumLikes - 1 : 0;
        else return prevNumLikes + 1;
      });
      return !prevVal;
    });

    setLoadingLike(true);
    const { data } = await makeRequest(
      'POST',
      '/api/messaging/updateLike',
      {
        messageID: props.message._id,
        liked: !liked,
      },
      true,
      props.accessToken,
      props.refreshToken
    );
    setLoadingLike(false);

    if (data['success'] === 1) setLiked(data['content']['newLiked']);
  }

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  function renderSuccessfulMessage() {
    return (
      <div className={styles.wrapper}>
        <div className={styles.left}>
          <div className={styles.top}>
            <RSText bold className={styles.senderName}>
              {props.message.senderName}
            </RSText>
            <RSText size={10} className={styles.time}>
              {getConversationTime(new Date(props.message.createdAt))}
            </RSText>
          </div>
          <div className={styles.bottom}>
            <RSText className={styles.message}>{props.message.content}</RSText>
          </div>
        </div>
        <div className={styles.right}>
          <FaEllipsisH
            aria-label="more"
            aria-controls="long-menu"
            aria-haspopup="true"
            onClick={handleClick}
            className={styles.ellipsis}
            size={17}
          />

          {/* <Menu
            id="long-menu"
            anchorEl={anchorEl}
            keepMounted
            open={open}
            onClose={handleClose}
            PaperProps={{
              style: {
                maxHeight: ITEM_HEIGHT * 4.5,
                width: 200,
              },
            }}
          >
            {options.map((option) => (
              <MenuItem
                key={option}
                selected={option === 'Cancel'}
                onClick={handleClose}
              >
                {option}
              </MenuItem>
            ))}
          </Menu> */}
          {liked ? (
            <FaStar onClick={handleLikeClicked} className={styles.star} size={20} />
          ) : (
            <FaRegStar
              onClick={handleLikeClicked}
              className={styles.starGray}
              size={20}
            />
          )}
          <RSText size={10} className={styles.likeCount}>
            {numLikes}
          </RSText>
        </div>
      </div>
    );
  }

  function renderErroredMessage() {
    return (
      <CustomTooltip title="There was an error sending this message">
        <div className={styles.errorWrapper}>
          <div className={styles.top}>
            <div>
              <RSText bold className={styles.senderName}>
                {props.message.senderName}
              </RSText>
              <RSText size={10} className={styles.time}>
                {getConversationTime(new Date(props.message.createdAt))}
              </RSText>
            </div>
          </div>
          <div className={styles.bottom}>
            <div className={styles.left}>
              <RSText className={styles.message}>{props.message.content}</RSText>
            </div>
          </div>
        </div>
      </CustomTooltip>
    );
  }

  const CustomTooltip = withStyles((theme: Theme) => ({
    tooltip: {
      backgroundColor: theme.palette.common.white,
      color: colors.brightError,
      boxShadow: theme.shadows[1],
      fontSize: 12,
    },
  }))(Tooltip);

  /* TODO - Think about removing the ellipsis and options from your own messages */
  return (
    <div>
      {props.message.error ? renderErroredMessage() : renderSuccessfulMessage()}
    </div>
  );
}

export default MyEventMessage;
