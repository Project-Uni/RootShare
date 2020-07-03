import React, { useState } from "react";

import EmojiEmotionsIcon from '@material-ui/icons/EmojiEmotions';
import { makeStyles } from "@material-ui/core/styles";
import { IconButton } from "@material-ui/core";
import { FaEllipsisH } from "react-icons/fa";
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import RootShareLogoFullWhite from "../../images/RootShareLogoFullWhite.png"

import RSText from "../../base-components/RSText";
import { colors } from "../../theme/Colors";

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    background: colors.ternary,
    // not final color
    borderRadius: 10,
    paddingBottom: 4,
    margin: 10
  },
  top: {
    display: "flex",
    justifyContent: "space-between",
  },
  left: {},
  right: {},
  picture: {
    margin: 10,
    marginTop: 18,
    marginBottom: -7,
    display: "inline-block",
    color: colors.primaryText,
  },
  organization: {
    marginLeft: 54,
    color: colors.primaryText,
    marginTop: 10,
  },
  bottom: {
    display: "flex",
    justifyContent: "space-between",
    margin: 0,
    //Questionable decision by me here below, but lets go with it for now
    marginTop: -20,
  },
  name: {
    marginRight: 4,
    marginBottom: 10,
    marginTop: -50,
    marginLeft: 10,
    display: "inline-block",
    color: colors.primaryText,
  },
  message: {
    marginRight: 3,
    display: "inline-block",
    color: colors.secondaryText,
  },
  ellipsis: {
    marginRight: -5,
    marginTop: -2,
    color: colors.primaryText,
    marginBottom: -13,
  },
  banner: {
    display: "flex",
    justifyContent: "center",
    marginTop: 10,
  },
  description: {
    marginTop: 5,
  }
}));

type Props = {
  eventID: string,
  eventName: string,
  eventDescription: string,
  organization: string,
  day: string,
  month: string,
  year: string,
  time: string,
  ampm: string,
  timezone: string,
  picture: string,
};

function SingleEvent(props: Props) {
  const styles = useStyles();
  const [liked, setLiked] = useState(false);

  function handleLikeClicked() {
    const oldVal = liked;
    setLiked(!oldVal);
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.top}>
        <div>
        <IconButton>
          <AddCircleOutlineIcon className={styles.ellipsis} />
        </IconButton>
          <RSText bold size={12} className={styles.name}>
            {props.eventName}
          </RSText>
          <RSText size={12} className={styles.message}>
            {props.month} {props.day} @ {props.time}{props.ampm}
          </RSText>
        </div>
      </div>
      <div className={styles.bottom}>
        <div className={styles.left}>
          <RSText size={12} className={styles.organization}>
            Hosted by {props.organization}
          </RSText>
        </div>
      </div>
      <div className={styles.banner}>
        <div>
          <img src={RootShareLogoFullWhite} width="300" height="100" />
          // used as sample "banner" for event
        </div>
      </div>
      <div className={styles.description}>
        <div>
          <RSText size={12} className={styles.organization}>
            {props.eventDescription} people registered.
          </RSText>
        </div>
      </div>
    </div>
  );
}

export default SingleEvent;
