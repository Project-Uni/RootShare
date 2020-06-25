import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Icon from '@material-ui/core/Icon';
import { IconButton, withTheme } from "@material-ui/core";
import { SvgIcon } from '@material-ui/core';
import EmojiEmotionsIcon from '@material-ui/icons/EmojiEmotions';
import { FaEllipsisH } from "react-icons/fa";

import RSText from "../../base-components/RSText";

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    background: "#202020",
    paddingBottom: 30,
  },
  top: {
    display: "inline-block",
    justifyContent: "space-between",
  },
  left: {
    marginTop: 0,
    marginLeft: 0,
    marginRight: 0,
    marginBottom: 0,
  },
  right: {
    marginTop: 0,
    marginLeft: 0,
    marginRight: 0,
    marginBottom: 0,
  },
  name: {
    display: "inline-block",
    color: "#f2f2f2",
    marginTop: 0,
    marginLeft: 10,
    marginRight: 5,
    marginBottom: 0,
  },
  organization: {
    display: "inline-block",
    color: "grey",
    marginTop: 3.5,
    marginLeft: 0,
    marginRight: 5,
    marginBottom: 0,
  },
  picture: {
    display: "inline-block",
    fill: "#ffffff",
    marginTop: 0,
    marginLeft: 5,
    marginRight: 0,
    marginBottom: -5,
  },
  ellipsis: {
    display: "inline-block",
    color: "#f2f2f2",
    marginTop: -5,
    marginLeft: 0,
    marginRight: 5,
    marginBottom: -5,
  },
}));

type Props = {
  name: string,
  nameId: string,
  organization: string,
  picture: string,
};

function ConnectionsDrawer(props: Props) {
  const styles = useStyles();
  const [liked, setLiked] = useState(false);

  function handleLikeClicked() {
    const oldVal = liked;
    setLiked(!oldVal);
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.top}>
        <EmojiEmotionsIcon className={styles.picture} />
        <RSText bold size={12} className={styles.name}>
          {props.name}
        </RSText>
        <RSText size={10} className={styles.organization}>
          from {props.organization}
        </RSText>
        <IconButton className={styles.ellipsis}>
          <FaEllipsisH size={12} color="grey" />
        </IconButton>
      </div>
    </div>
  );
}

export default ConnectionsDrawer;
