import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { IconButton, Menu, MenuItem } from "@material-ui/core";

import { FaEllipsisH, FaRegStar, FaStar } from "react-icons/fa";

import RSText from "../../base-components/RSText";

import { colors } from "../../theme/Colors";

const options = [
  'Connect with yourself?',
  'Cancel',
];

const ITEM_HEIGHT = 48;

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    background: colors.ternary,
    paddingBottom: 4,
  },
  top: {
    display: "flex",
    justifyContent: "space-between",
    paddingTop: 5,
  },
  left: {},
  right: {},
  senderName: {
    margin: 10,
    display: "inline-block",
    color: colors.background,
  },
  message: {
    marginLeft: 10,
    textAlign: "left",
    wordBreak: "break-all",
    color: "#f2f2f2",
    marginTop: 15,
  },
  bottom: {
    display: "flex",
    justifyContent: "space-between",
    margin: 0,
    marginTop: -20,
    paddingBottom: 5,
  },
  likeCount: {
    marginTop: -5,
    color: "#f2f2f2",
  },
  time: {
    marginLeft: 0,
    display: "inline-block",
    color: "grey",
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
};

//TODO ADD likes to messages
function MyEventMessage(props: Props) {
  const styles = useStyles();
  const [liked, setLiked] = useState(false);

  function handleLikeClicked() {
    const oldVal = liked;
    setLiked(!oldVal);
  }

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

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
            {props.senderName}
          </RSText>
          <RSText size={10} className={styles.time}>
            {props.time}
          </RSText>
        </div>
        <IconButton aria-label="more" aria-controls="long-menu" aria-haspopup="true" onClick={handleClick}>
          <FaEllipsisH className={styles.ellipsis} size={12} color="grey" />
        </IconButton>
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
          {options.map(option => (
            <MenuItem key={option} selected={option === 'Cancel'} onClick={handleClose}>
              {option}
            </MenuItem>
          ))}
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
                <FaRegStar color="grey" size={14} />
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

export default MyEventMessage;
