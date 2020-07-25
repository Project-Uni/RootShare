import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { IconButton, Menu, MenuItem } from '@material-ui/core';
import { FaEllipsisH, FaRegStar, FaStar } from 'react-icons/fa';
import RSText from '../../base-components/RSText';

import { connect } from 'react-redux';
import { makeRequest } from '../../helpers/makeRequest';

import { MessageType } from '../../types/messagingTypes';
import { getConversationTime } from '../../helpers/dateFormat';

const options = ['Connect', 'Cancel'];

const ITEM_HEIGHT = 48;

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    background: '#242d56',
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
  right: {},
  senderName: {
    margin: 10,
    display: 'inline-block',
    color: '#f2f2f2',
  },
  message: {
    marginLeft: 10,
    textAlign: 'left',
    wordBreak: 'break-all',
    color: '#f2f2f2',
    marginTop: 15,
  },
  bottom: {
    display: 'flex',
    justifyContent: 'space-between',
    margin: 0,
    marginTop: -20,
  },
  likeCount: {
    marginTop: -5,
    color: '#f2f2f2',
  },
  time: {
    marginLeft: 0,
    display: 'inline-block',
    color: 'grey',
  },
  ellipsis: {
    margin: 1.5,
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
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [loadingLike, setLoadingLike] = useState(false);
  const open = Boolean(anchorEl);

  const menuOpen = Boolean(anchorEl);

  useEffect(() => {
    fetchLiked();
  }, []);

  async function fetchLiked() {
    setLoadingLike(true);
    const { data } = await makeRequest(
      'POST',
      '/api/messaging/getLiked',
      {
        messageID: props.message._id,
      },
      true,
      props.accessToken,
      props.refreshToken
    );
    setLoadingLike(false);

    if (data['success'] === 1) setLiked(data['content']['liked']);
  }

  async function handleLikeClicked() {
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
    props.handleConnect && props.handleConnect(props.message.sender);
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
      <div className={styles.top}>
        <div>
          <RSText bold className={styles.senderName}>
            {props.message.senderName}
          </RSText>
          <RSText size={10} className={styles.time}>
            {getConversationTime(new Date(props.message.createdAt))}
          </RSText>
        </div>
        <IconButton
          aria-label="more"
          aria-controls="long-menu"
          aria-haspopup="true"
          onClick={handleOptionsClick}
        >
          <FaEllipsisH className={styles.ellipsis} size={12} color="grey" />
        </IconButton>
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
      </div>
      <div className={styles.bottom}>
        <div className={styles.left}>
          <RSText className={styles.message}>{props.message.content}</RSText>
        </div>
        <div className={styles.right}>
          <IconButton onClick={handleLikeClicked}>
            {liked ? (
              <FaStar color="#6699ff" size={14} />
            ) : (
              <FaRegStar color="grey" size={14} />
            )}
          </IconButton>
          <RSText size={10} className={styles.likeCount}>
            {props.message.numLikes}
          </RSText>
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = (state: { [key: string]: any }) => {
  return {
    accessToken: state.accessToken,
    refreshToken: state.refreshToken,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(EventMessage);
