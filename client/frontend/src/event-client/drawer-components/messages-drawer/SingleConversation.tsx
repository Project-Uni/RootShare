import React, { useState } from "react";

import EmojiEmotionsIcon from "@material-ui/icons/EmojiEmotions";
import { makeStyles } from "@material-ui/core/styles";
import { IconButton } from "@material-ui/core";
import { IoIosArrowForward } from "react-icons/io";

import RSText from "../../../base-components/RSText";
import { colors } from "../../../theme/Colors";

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    width: "98%",
    height: "70px",
    background: colors.secondary,
    paddingBottom: 4,
    borderTopStyle: "solid",
    borderTopWidth: "2px",
    borderBottomStyle: "solid",
    borderBottomWidth: "2px",
    borderColor: "white",
    marginTop: "-2px",
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
  message: {
    marginLeft: 54,
    color: "gray",
    marginTop: 10,
  },
  bottom: {
    display: "flex",
    justifyContent: "space-between",
    margin: 0,
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
  arrow: {
    margin: 1.5,
    marginTop: 27,
  },
}));

type Props = {
  conversation: any;
  userName: string;
  selectConversation: (conversation: any) => void;
};

function SingleConversation(props: Props) {
  const styles = useStyles();

  function joinUserNames(users: any, delimiter: string) {
    let joinedString = "";

    for (let i = 0; i < users.length; i++) {
      const currName = users[i].firstName;

      joinedString += currName;
      if (i !== users.length - 1) joinedString += delimiter;
    }

    return joinedString;
  }

  return (
    <div
      className={styles.wrapper}
      onClick={() => props.selectConversation(props.conversation)}
    >
      <div className={styles.top}>
        <div>
          <EmojiEmotionsIcon className={styles.picture} />
          <RSText bold size={12} className={styles.name}>
            {joinUserNames(props.conversation.participants, ", ")}
          </RSText>
        </div>

        <IoIosArrowForward
          size={18}
          color={colors.secondaryText}
          className={styles.arrow}
        />
      </div>
      <div className={styles.bottom}>
        <div className={styles.left}>
          <RSText size={12} className={styles.message}>
            {props.conversation.lastMessage.content}
          </RSText>
        </div>
      </div>
    </div>
  );
}

export default SingleConversation;
