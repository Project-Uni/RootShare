import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { TextField, IconButton } from "@material-ui/core";
import { MdSend } from "react-icons/md";
import { FaRegSmile } from "react-icons/fa";
import RSText from "../../base-components/RSText";

import EventMessage from "./EventMessage";
import MyEventMessage from "./MyEventMessage"

import { colors } from "../../theme/Colors";

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    width: "350px",
    display: "flex",
    flexDirection: "column",
    height: window.innerHeight - 60,
  },
  headerText: {
    margin: 0,
    display: "block",
  },
  messageTest: {},
  textFieldContainer: {
    display: "flex",
    justifyContent: "space-between",
    background: colors.secondary,
    color: colors.primaryText,
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 5,
  },
  textField: {
    width: 200,
    background: colors.ternary,
    color: colors.primaryText,
    label: colors.primaryText
  },
  messageContainer: {
    flex: 1,
    justifyContent: "flex-end",
    background: "white",
    overflow: "scroll",
    label: colors.primaryText,
  },
  input: {
    color: colors.primaryText,
    label: colors.primaryText,
  },
  cssLabel: {
    color: colors.primaryText,
    label: colors.primaryText,
  },
  cssFocused: {
    color: colors.primaryText,
    label: colors.primaryText,
    borderWidth: '2px',
    borderColor: colors.primaryText,
  },
  cssOutlinedInput: {
    '&$cssFocused $notchedOutline': {
      color: colors.primaryText,
      label: colors.primaryText,
      borderWidth: '2px',
      borderColor: colors.primaryText,
    }
  },
  notchedOutline: {
    borderWidth: '2px',
    label: colors.primaryText,
    borderColor: colors.primaryText,
    color: colors.primaryText,
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
    for (let i = 0; i < 3; i++) {
      output.push(
        <div className={styles.messageTest}>
          <EventMessage
            senderName="Chris Hartley"
            senderId="1001"
            message="What is RootShare????"
            likes={Math.floor(Math.random() * 1000 + 1)}
            time={getDate()}
          />
          <EventMessage
            senderName="Dhruv Patel"
            senderId="1002"
            message="Stay hungry."
            likes={Math.floor(Math.random() * 1000 + 1)}
            time={getDate()}
          />
          <EventMessage
            senderName="Ashwin Mahesh"
            senderId="1003"
            message="THE BABY BOILERS ARE BACK!!! #GottaGrow"
            likes={Math.floor(Math.random() * 1000 + 1)}
            time={getDate()}
          />
          <EventMessage
            senderName="Smit Desai"
            senderId="1004"
            message="When is the event?"
            likes={Math.floor(Math.random() * 1000 + 1)}
            time={getDate()}
          />
          <MyEventMessage
            senderName="Jackson McCluskey"
            senderId="1005"
            message="AUGUST 14, 2020 @ 7PM EST YESSIR!!!"
            likes={999}
            time={getDate()}
          />
          <EventMessage
            senderName="Reni Patel"
            senderId="1006"
            message="Who's going to present?!?!"
            likes={Math.floor(Math.random() * 1000 + 1)}
            time={getDate()}
          />
          <EventMessage
            senderName="Caite Capezzuto"
            senderId="1007"
            message="Robbie Hummel, Jajuan Johnson, and E’twaun Moore! It's gonna be hype!"
            likes={Math.floor(Math.random() * 1000 + 1)}
            time={getDate()}
          />
          <EventMessage
            senderName="Lauren Odle"
            senderId="1008"
            message="Register for the event today on rootshare.io and follow the Instagram! ;)"
            likes={Math.floor(Math.random() * 1000 + 1)}
            time={getDate()}
          />
          <EventMessage
            senderName="Nick O'Teen"
            senderId="1003"
            message="has left the chat."
            likes={193}
            time={getDate()}
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
          <FaRegSmile size={18} color={colors.primaryText} />
        </IconButton>
        <IconButton onClick={handleSendMessage}>
          <MdSend color={colors.primaryText} size={20} />
        </IconButton>
      </div>
    </div>
  );
}

export default EventMessageContainer;
