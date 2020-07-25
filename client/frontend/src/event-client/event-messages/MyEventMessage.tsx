import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { IconButton, Menu, MenuItem } from '@material-ui/core';

import { FaEllipsisH, FaRegStar, FaStar } from 'react-icons/fa';

import { connect } from 'react-redux';
import { makeRequest } from '../../helpers/makeRequest';

import { colors } from '../../theme/Colors';
import RSText from '../../base-components/RSText';
import { MessageType } from '../../types/messagingTypes';
import { getConversationTime } from '../../helpers/dateFormat';

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
    marginLeft: 10,
    textAlign: 'left',
    wordBreak: 'break-all',
    color: '#f2f2f2',
    marginTop: 7,
    marginBottom: 10,
  },
  bottom: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: -10,
  },
  likeCount: {
    marginRight: 5,
    color: '#f2f2f2',
    alignSelf: 'flex-end',
    marginBottom: 2,
  },
  star: {
    '&:hover': {
      color: colors.primaryText,
      cursor: 'pointer',
    },
    alignSelf: 'flex-end',
    marginBottom: 4,
    color: '#6699ff',
  },
  starGray: {
    '&:hover': {
      color: colors.primaryText,
      cursor: 'pointer',
    },
    alignSelf: 'flex-end',
    marginBottom: 4,
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
    marginBottom: 7,
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

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

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
        {/* TODO - Think about removing the ellipsis and options from your own messages */}
        <div className={styles.right}>
          <FaEllipsisH
            aria-label="more"
            aria-controls="long-menu"
            aria-haspopup="true"
            onClick={handleClick}
            className={styles.ellipsis}
            size={12}
          />

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
          <div className={styles.rightBottom}>
            <RSText size={10} className={styles.likeCount}>
              {props.message.numLikes}
            </RSText>
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
          </div>
        </div>
      </div>
      <div className={styles.bottom}>
        <div className={styles.left}>
          <RSText className={styles.message}>{props.message.content}</RSText>
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

export default connect(mapStateToProps, mapDispatchToProps)(MyEventMessage);
