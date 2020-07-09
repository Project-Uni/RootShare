import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { TextField, IconButton } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { MdSend } from "react-icons/md";
import { FaRegSmile } from "react-icons/fa";
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
  textFieldContainer: {
    display: "flex",
    justifyContent: "space-between",
    background: "#333333",
    borderTop: "1px solid #333333",
    color: "#f2f2f2",
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 5,
  },
  textField: {
    width: 200,
    background: "#333333",
    color: "#f2f2f2",
    label: "#f2f2f2",
  },
  cssLabel: {
    color: "#f2f2f2",
    label: "#f2f2f2",
  },
  cssFocused: {
    color: "#f2f2f2",
    label: "#f2f2f2",
    borderWidth: "2px",
    borderColor: "#f2f2f2 !important",
  },
  cssOutlinedInput: {
    "&$cssFocused $notchedOutline": {
      color: "#f2f2f2 !important",
      label: "#f2f2f2 !important",
      borderWidth: "2px",
      borderColor: "#f2f2f2 !important",
    },
  },
}));

type Props = {
  conversationID: string;
  messages: any[];
  returnToConversations: () => void;
};

function MessageThreadContainer(props: Props) {
  const styles = useStyles();

  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {}, []);

  function renderLatestMessages() {
    let output: any[] = [];
    props.messages.forEach((message: any) => {
      output.push(
        <div key={message._id} id={message._id}>
          {message.senderName}:{message.content}
        </div>
      );
    });

    return output;
  }

  function handleMessageChange(event: any) {
    setNewMessage(event.target.value);
  }

  function handleSendMessage() {
    axios.post("/api/messaging/sendMessage", {
      conversationID: props.conversationID,
      message: newMessage,
    });
    setNewMessage("");
  }

  function handleEmojiClick() {
    console.log("Clicked on emoji button");
  }

  return (
    <div className={styles.wrapper}>
      <button onClick={props.returnToConversations}>Back</button>
      <p>Current Messages</p>
      <div className={styles.messageContainer}>{renderLatestMessages()}</div>

      <div className={styles.textFieldContainer}>
        <TextField
          multiline
          type="search"
          label="Aa"
          variant="outlined"
          className={styles.textField}
          onChange={handleMessageChange}
          value={newMessage}
          InputLabelProps={{
            classes: {
              root: styles.cssLabel,
              focused: styles.cssFocused,
            },
          }}
          InputProps={{
            classes: {
              root: styles.cssOutlinedInput,
              focused: styles.cssFocused,
              // notchedOutline: styles.notchedOutline,
            },
            inputMode: "numeric",
          }}
        />
        <IconButton onClick={handleEmojiClick}>
          <FaRegSmile size={18} color="#f2f2f2" />
        </IconButton>
        <IconButton onClick={handleSendMessage}>
          <MdSend color="#f2f2f2" size={20} />
        </IconButton>
      </div>
    </div>
  );
}

export default MessageThreadContainer;
