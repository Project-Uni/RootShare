import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { TextField, IconButton } from "@material-ui/core";
import { MdSend } from "react-icons/md";
import { FaRegSmile } from "react-icons/fa";
import RSText from "../../base-components/RSText";

import EventMessage from "./EventMessage";
import MyEventMessage from "./MyEventMessage";

const HEADER_HEIGHT = 60;
const useStyles = makeStyles((_: any) => ({
  wrapper: {
    width: "300px",
    display: "flex",
    flexDirection: "column",
  },
  headerText: {
    margin: 0,
    display: "block",
  },
  messageTest: {},
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
    label: "#f2f2f2"
  },
  messageContainer: {
    flex: 1,
    justifyContent: "flex-end",
    background: "white",
    overflow: "scroll",
    label: "#f2f2f2",
  },
  input: {
    color: "#f2f2f2",
    label: "#f2f2f2",
    borderWidth: "1px",
    borderColor: "#6699ff !important",
  },
  cssLabel: {
    color: "#f2f2f2",
    label: "#f2f2f2",
  },
  cssFocused: {
    color: "#f2f2f2",
    label: "#f2f2f2",
    borderWidth: '2px',
    borderColor: '#f2f2f2 !important',
  },
  cssOutlinedInput: {
    '&$cssFocused $notchedOutline': {
      color: "#f2f2f2 !important",
      label: "#f2f2f2 !important",
      borderWidth: '2px',
      borderColor: '#f2f2f2 !important',
    }
  },
  notchedOutline: {
    borderWidth: '2px',
    label: "#f2f2f2",
    borderColor: '#f2f2f2 !important',
    color: "#f2f2f2 !important",
  },
}));

type Props = {};

function getDate() {
  let tempDate = new Date();


  let ampm = "AM";
  let hours = tempDate.getHours() === 0
    ? 12
    : tempDate.getHours();

  if (tempDate.getHours() > 12) {
    ampm = "PM";
    hours = hours - 12;
  }

  let minutes = tempDate.getMinutes() < 10
    ? "0" + tempDate.getMinutes()
    : tempDate.getMinutes();

  return hours + ":" + minutes + " " + ampm;
}

function EventMessageContainer(props: Props) {
  const styles = useStyles();
  const [message, setMessage] = useState("");
  const [height, setHeight] = useState(window.innerHeight - HEADER_HEIGHT);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
  }, []);

  function handleResize() {
    setHeight(window.innerHeight - HEADER_HEIGHT);
  }

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
            time={getDate()}
          />
          <EventMessage
            senderName="Nat E. Lite"
            senderId="1001"
            message="Who do you know here?"
            likes={Math.floor(Math.random() * 1000 + 1)}
            time={getDate()}
          />
          <EventMessage
            senderName="Kapt N. Morgan"
            senderId="1001"
            message="Rush Rho Sigma!! (Root Share)"
            likes={Math.floor(Math.random() * 1000 + 1)}
            time={getDate()}
          />
          <MyEventMessage
            senderName="Nick O'teen"
            senderId="1002"
            message="We have a strict no hazing policy."
            likes={Math.floor(Math.random() * 1000 + 1)}
            time={getDate()}
          />
        </div>
      );
    }
    return output;
  }
  return (
    <div className={styles.wrapper} style={{ height: height }}>
      <div className={styles.messageContainer}>{testRenderMessages()}</div>

      <div className={styles.textFieldContainer}>
        <TextField
          multiline
          type='search'
          label="Aa"
          variant="outlined"
          className={styles.textField}
          onChange={handleMessageChange}
          value={message}
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
            inputMode: "numeric"
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

export default EventMessageContainer;
