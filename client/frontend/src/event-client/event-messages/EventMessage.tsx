import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { IconButton, Menu, MenuItem } from '@material-ui/core';
import { FaEllipsisH, FaRegStar, FaStar } from 'react-icons/fa';
import RSText from '../../base-components/RSText';

const options = ['Connect', 'Cancel'];

const ITEM_HEIGHT = 48;

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    background: '#242d56',
    paddingBottom: 4,
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
    //Questionable decision by me here below, but lets go with it for now
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
  senderName: string;
  senderId: string;
  message: string;
  likes: number;
  time: string;
  handleConnect?: (userID: string) => boolean;
  connected?: boolean;
};

function EventMessage(props: Props) {
  const styles = useStyles();
  const [liked, setLiked] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);

  const menuOpen = Boolean(anchorEl);

  function handleOptionsClick(event: any) {
    setAnchorEl(event.currentTarget);
  }

  function handleClose() {
    setAnchorEl(null);
  }

  function handleConnect() {
    props.handleConnect && props.handleConnect(props.senderId);
    setAnchorEl(null);
  }

  function handleLikeClicked() {
    const oldVal = liked;
    setLiked(!oldVal);
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
            {props.senderName}
          </RSText>
          <RSText size={10} className={styles.time}>
            {props.time}
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
          <RSText className={styles.message}>{props.message}</RSText>
        </div>
        <div className={styles.right}>
          <IconButton onClick={handleLikeClicked}>
            {liked ? (
              <FaStar color="#6699ff" size={14} />
            ) : (
              //faHeart #800000
              <FaRegStar color="grey" size={14} />
              //faRegHeart #800000
            )}
          </IconButton>
          <RSText size={10} className={styles.likeCount}>
            {props.likes}
          </RSText>
        </div>
      </div>
    </div>
  );
}

export default EventMessage;
