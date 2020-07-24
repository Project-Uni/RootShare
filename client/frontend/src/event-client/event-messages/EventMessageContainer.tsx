import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { TextField, IconButton, Modal } from '@material-ui/core';

import 'emoji-mart/css/emoji-mart.css';
import { Picker } from 'emoji-mart';

import { MdSend } from 'react-icons/md';
import { FaRegSmile } from 'react-icons/fa';

import { connect } from 'react-redux';
import { makeRequest } from '../../helpers/makeRequest';

import EventMessage from './EventMessage';
import MyEventMessage from './MyEventMessage';
import { colors } from '../../theme/Colors';

const HEADER_HEIGHT = 58;
const ITEM_HEIGHT = 48;

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    width: '350px',
    display: 'flex',
    flexDirection: 'column',
  },
  headerText: {
    margin: 0,
    display: 'block',
  },
  messageTest: {},
  textFieldContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    background: colors.secondary,
    color: colors.primaryText,
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 5,
  },
  textField: {
    width: 250,
    background: colors.ternary,
    color: colors.primaryText,
    label: colors.primaryText,
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    background: 'white',
    overflow: 'scroll',
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
    },
  },
  notchedOutline: {
    borderWidth: '2px',
    label: colors.primaryText,
    borderColor: colors.primaryText,
    color: colors.primaryText,
  },
  paper: {
    width: 270,
  },
  icon: {
    color: colors.primaryText,
    '&:hover': {
      color: colors.bright,
    },
  },
}));

type MessageType = {
  _id: string;
  conversationID: string;
  senderName: string;
  sender: string;
  content: string;
  createdAt: string;
};

type Props = {
  conversationID: string;
  accessToken: string;
  refreshToken: string;
};

function getDate() {
  let tempDate = new Date();

  let ampm = 'AM';
  let hours = tempDate.getHours() === 0 ? 12 : tempDate.getHours();

  if (tempDate.getHours() > 12) {
    ampm = 'PM';
    hours = hours - 12;
  }

  let minutes =
    tempDate.getMinutes() < 10 ? '0' + tempDate.getMinutes() : tempDate.getMinutes();

  return hours + ':' + minutes + ' ' + ampm;
}

function EventMessageContainer(props: Props) {
  const styles = useStyles();

  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [height, setHeight] = useState(window.innerHeight - HEADER_HEIGHT);
  const [modalStyle, setModalStyle] = useState(getModalStyle);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [props.conversationID]);

  async function fetchMessages() {
    if (props.conversationID === undefined) return;
    const { data } = await makeRequest(
      'POST',
      '/api/messaging/getLatestMessages',
      {
        conversationID: props.conversationID,
      },
      true,
      props.accessToken,
      props.refreshToken
    );

    if (data['success'] !== 1) return;
    const messages = data['content']['messages'];
    setMessages(messages);
  }

  function handleResize() {
    setHeight(window.innerHeight - HEADER_HEIGHT);
    setModalStyle(getModalStyle());
  }

  function getModalStyle() {
    const bottom = 100;
    const right = 50;
    const containerWidth = 270;
    const containerHeight = 400;
    return {
      bottom,
      right,
      transform: `translate(${window.innerWidth -
        containerWidth -
        right}px, ${window.innerHeight - containerHeight - bottom}px)`,
    };
  }

  function onEmojiClick(emoji: { [key: string]: any }) {
    const updateMessage = newMessage + emoji.native + ' ';
    setNewMessage(updateMessage);
  }

  function handleMessageChange(event: any) {
    setNewMessage(event.target.value);
  }

  function handleSendMessage() {
    setNewMessage((prevMessage) => {
      makeRequest(
        'POST',
        '/api/messaging/sendMessage',
        { conversationID: props.conversationID, message: prevMessage },
        true,
        props.accessToken,
        props.refreshToken
      );

      return '';
    });
  }

  function handleOpen() {
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
  }

  function renderEmojiPicker() {
    return (
      <div style={modalStyle} className={styles.paper}>
        <Picker
          set="apple"
          onSelect={onEmojiClick}
          title="Spice it up"
          perLine={7}
          theme="dark"
          showPreview={false}
          sheetSize={64}
          emoji=""
        />
      </div>
    );
  }

  function renderMessages() {
    let output: any = [];
    messages.forEach((message: MessageType) => {
      output.push(
        <EventMessage
          senderName={message.senderName}
          senderId={message.sender}
          message={message.content}
          likes={Math.floor(Math.random() * 1000 + 1)}
          time={message.createdAt}
        />
      );
    });

    return output;
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
    <div className={styles.wrapper} style={{ height: height }}>
      <div className={styles.messageContainer}>{renderMessages()}</div>

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
            inputMode: 'numeric',
          }}
        />
        <div>
          <IconButton
            aria-label="more"
            aria-controls="long-menu"
            aria-haspopup="true"
            onClick={handleOpen}
          >
            <FaRegSmile size={24} className={styles.icon}></FaRegSmile>
          </IconButton>
          <Modal open={open} onClose={handleClose}>
            {renderEmojiPicker()}
          </Modal>
          <IconButton onClick={handleSendMessage}>
            <MdSend size={20} className={styles.icon} />
          </IconButton>
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = (state: { [key: string]: any }) => {
  return {
    accessToken: state.accessToken,
    refreshToken: state.refreshToken,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(EventMessageContainer);
