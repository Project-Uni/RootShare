import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { Menu, MenuItem } from '@material-ui/core';
import { FaEllipsisH, FaRegStar, FaStar } from 'react-icons/fa';

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
  },
  top: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  left: {},
  right: {
    display: 'flex',
    flexDirection: 'column',
    alignContent: 'flex-end',
    marginRight: 12,
    marginTop: 7,
    marginBottom: 5,
  },
  rightBottom: {
    display: 'flex',
    marginRight: -2,
  },
  senderName: {
    margin: 10,
    display: 'inline-block',
    color: colors.background,
  },
  message: {
    textAlign: 'left',
    color: '#f2f2f2',
    marginLeft: 10,
    marginRight: 10,
    marginTop: 7,
    marginBottom: 10,
  },
  bottom: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: -10,
  },
  likeCount: {
    color: '#f2f2f2',
    alignSelf: 'flex-end',
    marginBottom: 3,
  },
  star: {
    '&:hover': {
      color: colors.primaryText,
      cursor: 'pointer',
    },
    alignSelf: 'flex-end',
    marginTop: -10,
    marginBottom: 4,
    marginRight: -4,
    color: '#6699ff',
  },
  starGray: {
    '&:hover': {
      color: colors.primaryText,
      cursor: 'pointer',
    },
    alignSelf: 'flex-end',
    marginTop: -10,
    marginBottom: 4,
    marginRight: -4,
    color: 'grey',
  },
  time: {
    marginLeft: 0,
    display: 'inline-block',
    color: 'grey',
  },
  ellipsis: {
    '&:hover': {
      color: colors.primaryText,
      cursor: 'pointer',
    },
    alignSelf: 'flex-end',
    color: 'grey',
    marginBottom: 18,
    marginRight: 10,
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
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [loadingLike, setLoadingLike] = useState(false);
  const open = Boolean(anchorEl);

  useEffect(() => {
    setLiked(props.message.liked);
  }, [props.message.liked]);

  async function handleLikeClicked() {
    setLiked((prevVal) => !prevVal);
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

  /* TODO - Think about removing the ellipsis and options from your own messages */
  return (
    <div className={styles.wrapper}>
      <div className={styles.top}>
        <div>
          <RSText bold className={styles.senderName}>
            {props.message.senderName}
          </RSText>
          <RSText size={10} className={styles.time}>
            {getConversationTime(new Date(props.message.createdAt))}
          </RSText>
        </div>

        <FaEllipsisH
          aria-label="more"
          aria-controls="long-menu"
          aria-haspopup="true"
          onClick={handleClick}
          className={styles.ellipsis}
          size={12}
        />
        {props.message.error ? <RSText>ERRRORRRRRR</RSText> : null}

        <Menu
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
        </Menu>
      </div>
      <div className={styles.bottom}>
        <div className={styles.left}>
          <RSText className={styles.message}>{props.message.content}</RSText>
        </div>
        <div className={styles.right}>
          {liked ? (
            <FaStar
              // disabled={loadingLike}
              onClick={handleLikeClicked}
              className={styles.star}
              size={16}
            />
          ) : (
            <FaRegStar
              // disabled={loadingLike}
              onClick={handleLikeClicked}
              className={styles.starGray}
              size={16}
            />
          )}
          <RSText size={10} className={styles.likeCount}>
            {props.message.numLikes}
          </RSText>
        </div>
      </div>
    </div>
  );
}

export default MyEventMessage;
