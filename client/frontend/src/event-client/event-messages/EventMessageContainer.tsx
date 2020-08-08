import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';

import { makeStyles } from '@material-ui/core/styles';

import EventMessage from './EventMessage';
import MyEventMessage from './MyEventMessage';
import { colors } from '../../theme/Colors';
import EventMessageTextField from './EventMessageTextField';

import { MessageType, LikeUpdateType } from '../../helpers/types';
import { makeRequest } from '../../helpers/functions';

const HEADER_HEIGHT = 64;
const MAX_MESSAGES = 40;

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
    borderTopStyle: 'solid',
    borderTopWidth: 1,
    borderTopColor: 'lightgray',
  },
  textField: {
    width: 250,
    background: colors.ternary,
    color: colors.primaryText,
    label: colors.primaryText,
  },
  messageContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    background: colors.secondary,
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
    shrink: false,
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

type Props = {
  user: { [key: string]: any };
  conversationID: string;
  accessToken: string;
  refreshToken: string;
  newMessage: MessageType;
  socket: SocketIOClient.Socket;
};

function EventMessageContainer(props: Props) {
  const styles = useStyles();

  const [messages, setMessages] = useState<MessageType[]>([]);
  const [height, setHeight] = useState(window.innerHeight - HEADER_HEIGHT);
  const [likeUpdate, setLikeUpdate] = useState<LikeUpdateType>();

  useEffect(() => {
    window.addEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    updateLikes();
  }, [likeUpdate]);

  useEffect(() => {
    if (
      Object.keys(props.socket).length === 0 ||
      props.conversationID === '' ||
      props.conversationID === undefined ||
      props.user === undefined
    )
      return;
    fetchMessages();
  }, [props.socket, props.conversationID, props.user]);

  useEffect(() => {
    if (
      Object.keys(props.socket).length === 0 ||
      props.conversationID === '' ||
      props.conversationID === undefined
    )
      return;

    props.socket.emit('connectToConversation', props.conversationID);
    props.socket.on('updateLikes', (messageData: any) => {
      setLikeUpdate(messageData);
    });
  }, [props.socket, props.conversationID]);

  useEffect(() => {
    handleNewMessage(props.newMessage);
  }, [props.newMessage]);

  function updateLikes() {
    if (likeUpdate === undefined) return;
    const { messageID } = likeUpdate;
    messages.forEach((message) => {
      if (message._id === messageID) message.numLikes = likeUpdate.numLikes;
    });
  }

  function handleNewMessage(newMessage: MessageType) {
    if (
      Object.keys(newMessage).length === 0 ||
      newMessage === undefined ||
      newMessage === null ||
      newMessage.conversationID !== props.conversationID
    )
      return;

    if (!newMessage['numLikes']) newMessage.numLikes = 0;

    if (newMessage.sender === props.user._id)
      for (let i = 0; i < messages.length; i++) {
        if (messages[i].tempID === newMessage.tempID) {
          // let newMessages = messages.slice();
          // newMessages[i] = newMessage;
          // setMessages(newMessages);
          return;
        }
      }

    addMessage(newMessage);
  }

  function addMessage(newMessage: MessageType) {
    setMessages((prevMessages) => {
      let newMessages = prevMessages.concat(newMessage);
      const numMessages = newMessages.length;
      if (numMessages > MAX_MESSAGES)
        newMessages = newMessages.slice(numMessages - MAX_MESSAGES, numMessages);
      return newMessages;
    });
  }

  function addMessageErr(tempID: string) {
    setMessages((prevMessages) => {
      let newMessages = prevMessages.slice();
      for (let i = newMessages.length - 1; i >= 0; i--) {
        if (newMessages[i].tempID === tempID) newMessages[i].error = true;
        return newMessages;
      }

      return newMessages;
    });
  }

  async function fetchMessages() {
    const { data } = await makeRequest(
      'POST',
      '/api/messaging/getLatestMessages',
      {
        conversationID: props.conversationID,
        maxMessages: MAX_MESSAGES,
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
  }

  async function handleSendMessage(message: string) {
    const tempID = messages.length.toString();
    const newMessageObj = {
      conversationID: props.conversationID,
      sender: props.user._id,
      senderName: `${props.user.firstName} ${props.user.lastName}`,
      content: message,
      createdAt: new Date(),
      numLikes: 0,
      tempID: tempID,
    };
    addMessage(newMessageObj as MessageType);

    const { data } = await makeRequest(
      'POST',
      '/api/messaging/sendMessage',
      { conversationID: props.conversationID, message, tempID },
      true,
      props.accessToken,
      props.refreshToken
    );

    if (data['success'] === 1 && data['content']['tempID'])
      addMessageErr(data['content']['tempID']);
    else alert('REAL ERROR: ' + data['message']);
  }

  function renderMessages() {
    const numMessages = messages.length;
    if (numMessages === 0) return;

    let output: any = [];
    output.push(<div key={0} style={{ marginTop: 'auto' }}></div>);
    for (let i = 0; i < numMessages; i++) {
      const temp = messages[i];
      const message = temp; //.error ? { ...temp } : temp;

      output.push(
        message.sender !== props.user._id ? (
          <EventMessage
            key={message._id}
            message={message}
            accessToken={props.accessToken}
            refreshToken={props.refreshToken}
          />
        ) : (
          <MyEventMessage
            key={message._id || message.tempID}
            message={message}
            accessToken={props.accessToken}
            refreshToken={props.refreshToken}
          />
        )
      );
    }

    return output;
  }

  function scrollToBottom() {
    const messageContainer = document.getElementById('messageContainer');
    messageContainer?.scrollTo(0, messageContainer?.scrollHeight);
  }

  return (
    <div className={styles.wrapper} style={{ height: height }}>
      <div id="messageContainer" className={styles.messageContainer}>
        {renderMessages()}
      </div>

      <EventMessageTextField handleSendMessage={handleSendMessage} />
    </div>
  );
}

const mapStateToProps = (state: { [key: string]: any }) => {
  return {
    user: state.user,
    accessToken: state.accessToken,
    refreshToken: state.refreshToken,
    newMessage: state.newMessage,
    socket: state.socket,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(EventMessageContainer);
