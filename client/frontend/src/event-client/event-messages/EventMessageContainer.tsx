import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { TextField, IconButton } from "@material-ui/core";
import { MdSend } from "react-icons/md";
import { FaRegSmile } from "react-icons/fa";
import RSText from "../../base-components/RSText";

import EventMessage from "./EventMessage";
import MyEventMessage from "./MyEventMessage"

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
  //  marginBottom: 4,
  },
  textFieldContainer: {
    display: "flex",
    justifyContent: "space-between",
    background: "white",
    borderTop: "1px solid #3D66DE",
  },
  textField: {
    width: 200,
  },
  messageContainer: {
    flex: 1,
    justifyContent: "flex-end",
    background: "white",
    overflow: "scroll",
  }
}));

type Props = {};

function GetDate() {
  var tempDate = new Date();
  var date = tempDate.getHours()+':'+ tempDate.getMinutes();
  const currDate = ""+date;
  return currDate;
}

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
    for (let i = 0; i <= 10; i++) {
      output.push(
        <div className={styles.messageTest}>
          <EventMessage
            senderName="Henny C."
            senderId="1001"
            message="Who do you know here?"
            likes={Math.floor(Math.random() * 1000 + 1)}
            time={GetDate()}
          />
          <EventMessage
            senderName="Nat E. Lite"
            senderId="1001"
            message="Who do you know here?"
            likes={Math.floor(Math.random() * 1000 + 1)}
            time={GetDate()}
          />
          <EventMessage
            senderName="Kapt N. Morgan"
            senderId="1001"
            message="Rush Rho Sigma!! (Root Share)"
            likes={Math.floor(Math.random() * 1000 + 1)}
            time={GetDate()}
          />
          <MyEventMessage
            senderName="Nick O'teen"
            senderId="1002"
            message="We have a strict no hazing policy."
            likes={Math.floor(Math.random() * 1000 + 1)}
            time={GetDate()}
          />
        </div>
      );
    }
    return output;
  }
  return (
    <div className={styles.wrapper}>
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
