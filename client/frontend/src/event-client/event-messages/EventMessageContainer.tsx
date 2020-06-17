import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { TextField, IconButton } from "@material-ui/core";
import { MdSend } from "react-icons/md";
import { FaRegSmile } from "react-icons/fa";
import RSText from "../../base-components/RSText";

import EventMessage from "./EventMessage";

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    width: "300px",
    display: "flex",
    flexDirection: "column",
    height: window.innerHeight - 100,
  },
  headerText: {
    margin: 0,
    display: "block",
  },
  messageTest: {
    marginBottom: 7,
  },
  textFieldContainer: {
    display: "flex",
    justifyContent: "space-between",
    background: "white",
    borderTop: "1px solid #3D66DE",
  },
  textField: {
    width: 225,
  },
  messageContainer: {
    flex: 1,
    justifyContent: "flex-end",
    background: "lightgray",
    overflow: "scroll",
  },
}));

type Props = {};

function EventMessageContainer(props: Props) {
  const styles = useStyles();
  const [message, setMessage] = useState("");

  function handleMessageChange(event: any) {
    setMessage(event.target.value);
  }

  function handleSendMessage() {
    console.log(`Sending message: ${message}`);
    setMessage("");
  }

  function handleEmojiClick() {
    console.log("Clicked on emoji button");
  }

  function testRenderMessages() {
    const output = [];
    for (let i = 0; i <= 20; i++) {
      output.push(
        <div className={styles.messageTest}>
          <EventMessage
            senderName="Billy Joel"
            senderId="1001"
            message="Hello world! I'm Sending One two three four five!"
            likes={Math.floor(Math.random() * 1000 + 1)}
          />
        </div>
      );
    }
    return output;
  }
  return (
    <div className={styles.wrapper}>
      <RSText type="head" bold italic size={24} className={styles.headerText}>
        Messages
      </RSText>
      <div className={styles.messageContainer}>{testRenderMessages()}</div>

      <div className={styles.textFieldContainer}>
        <TextField
          multiline
          label="Aa"
          variant="outlined"
          className={styles.textField}
          onChange={handleMessageChange}
          value={message}
        />
        <IconButton onClick={handleEmojiClick}>
          <FaRegSmile size={18} color="gray" />
        </IconButton>
        <IconButton onClick={handleSendMessage}>
          <MdSend color="#3D66DE" size={20} />
        </IconButton>
      </div>
    </div>
  );
}

export default EventMessageContainer;
