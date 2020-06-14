import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { IconButton } from "@material-ui/core";

import { FaEllipsisH, FaRegStar, FaStar } from "react-icons/fa";

import RSText from "../../base-components/RSText";

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
  top: {
    display: "flex",
    justifyContent: "space-between",
  },
  left: {},
  right: {},
  senderName: {
    margin: 0,
  },
  message: {
    margin: 0,
    textAlign: "left",
  },
  bottom: {
    display: "flex",
    justifyContent: "space-between",
    margin: 0,
  },
  likeCount: {
    margin: 0,
  },
}));

type Props = {
  senderName: string;
  senderId: string;
  message: string;
  likes: number;
};

//TODO ADD likes to messages
function EventMessage(props: Props) {
  const styles = useStyles();
  const [liked, setLiked] = useState(false);

  function handleLikeClicked() {
    const oldVal = liked;
    setLiked(!oldVal);
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.top}>
        <RSText bold className={styles.senderName}>
          {props.senderName}
        </RSText>
        <IconButton>
          <FaEllipsisH size={12} />
        </IconButton>
      </div>
      <div className={styles.bottom}>
        <div className={styles.left}>
          <RSText className={styles.message}>{props.message}</RSText>
        </div>
        <div className={styles.right}>
          <IconButton onClick={handleLikeClicked}>
            {liked ? (
              <FaStar color="#3D66DE" size={14} />
            ) : (
              <FaRegStar color="gray" size={14} />
            )}
          </IconButton>
          <RSText size={10} className={styles.likeCount} italic>
            {props.likes}
          </RSText>
        </div>
      </div>
    </div>
  );
}

export default EventMessage;
