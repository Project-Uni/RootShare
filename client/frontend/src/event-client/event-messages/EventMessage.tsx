import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { IconButton, Menu, MenuItem } from '@material-ui/core';
import { FaEllipsisH, FaRegStar, FaStar } from 'react-icons/fa';

import { makeRequest } from '../../helpers/functions';

import { MessageType } from '../../helpers/types';
import { getConversationTime } from '../../helpers/functions';

import RSText from '../../base-components/RSText';
import { colors } from '../../theme/Colors';

const options = ['Connect', 'Cancel'];

const ITEM_HEIGHT = 48;

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    background: '#242d56',
    paddingBottom: 4,
    borderTopStyle: 'solid',
    borderWidth: '1px',
    borderColor: 'lightgray',
    display: 'flex',
  },
  top: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  left: {
    display: 'flex',
    flexDirection: 'column',
  },
  right: {
    display: 'flex',
    flexDirection: 'column',
    alignContent: 'flex-end',
    marginRight: 12,
    marginTop: 7,
    marginBottom: 5,
    marginLeft: 'auto',
  },
  senderName: {
    margin: 10,
    display: 'inline-block',
    color: '#f2f2f2',
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
    maxWidth: 300,
  },
  bottom: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: -10,
    maxWidth: 309,
  },
  likeCount: {
    marginRight: 1,
    color: '#f2f2f2',
    alignSelf: 'flex-end',
  },
  star: {
    '&:hover': {
      color: colors.primaryText,
      cursor: 'pointer',
    },
    alignSelf: 'flex-end',
    marginTop: -10,
    marginBottom: 4,
    marginRight: -3,
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
    marginRight: -3,
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
    alignSelf: 'flex-end',
    color: 'grey',
    marginBottom: 18,
    marginRight: -1,
  },
}));

type Props = {
  message: MessageType;
  handleConnect?: (userID: string) => boolean;
  connected?: boolean;
  accessToken: string;
  refreshToken: string;
};

function EventMessage(props: Props) {
  const styles = useStyles();
  const [liked, setLiked] = useState(false);
  const [numLikes, setNumLikes] = useState(0);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [loadingLike, setLoadingLike] = useState(false);
  const open = Boolean(anchorEl);

  const menuOpen = Boolean(anchorEl);

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

  function handleOptionsClick(event: any) {
    setAnchorEl(event.currentTarget);
  }

  function handleClose() {
    setAnchorEl(null);
  }

  function handleConnect() {
    const sender = props.message.sender as string;
    props.handleConnect && props.handleConnect(sender);
    setAnchorEl(null);
  }

  function renderOptions() {
    const output = [];
    for (let i = 0; i < options.length; i++) {
      output.push(
        <MenuItem
          key={options[i]}
          onClick={options[i] === 'Cancel' ? handleClose : handleConnect}
        >
          {options[i]}
        </MenuItem>
      );
    }
    return output;
  }

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
          onClick={handleOptionsClick}
          className={styles.ellipsis}
          size={12}
        />

        <Menu
          id="long-menu"
          anchorEl={anchorEl}
          keepMounted
          open={menuOpen}
          onClose={handleClose}
          PaperProps={{
            style: {
              maxHeight: ITEM_HEIGHT * 4.5,
              width: 200,
            },
          }}
        >
          {renderOptions()}
        </Menu>
        {liked ? (
          <FaStar
            // disabled={loadingLike}
            className={styles.star}
            onClick={handleLikeClicked}
            size={16}
          />
        ) : (
          <FaRegStar
            // disabled={loadingLike}
            className={styles.starGray}
            onClick={handleLikeClicked}
            size={16}
          />
        )}
        <RSText size={10} className={styles.likeCount}>
          {numLikes}
        </RSText>
      </div>
    </div>
  );
}

export default EventMessage;
