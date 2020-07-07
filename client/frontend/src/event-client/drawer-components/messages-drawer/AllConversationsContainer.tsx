import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { makeStyles } from "@material-ui/core/styles";
import axios from "axios";

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    width: "300px",
    display: "flex",
    flexDirection: "column",
    height: window.innerHeight - 60,
  },
  messageContainer: {
    flex: 1,
    justifyContent: "flex-end",
    // background: "white",
    overflow: "scroll",
    label: "#f2f2f2",
  },
}));

type Props = {
  conversations: any[];
  selectConversation: (conversation: any) => void;
};

function AllConversationsContainer(props: Props) {
  const styles = useStyles();

  useEffect(() => {}, []);

  function renderLatestConversations() {
    let output: any[] = [];
    props.conversations.forEach((conversation: any) => {
      const currID = conversation._id;
      output.push(
        <div
          key={currID}
          id={currID}
          onClick={() => props.selectConversation(conversation)}
        >
          {conversation.lastMessage.content}
        </div>
      );
    });

    return output;
  }

  return (
    <div className={styles.wrapper}>
      <p>Current Conversations</p>
      <div className={styles.messageContainer}>
        {renderLatestConversations()}
      </div>
    </div>
  );
}

export default AllConversationsContainer;
