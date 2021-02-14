import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';

import { Slide } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { TransitionProps } from '@material-ui/core/transitions';

import EventMessage from './EventMessage';
import MyEventMessage from './MyEventMessage';
import { colors } from '../../theme/Colors';
import EventMessageTextField from './EventMessageTextField';
import ManageSpeakersSnackbar from '../event-video/event-host/ManageSpeakersSnackbar';
import { RSButton } from '../..//main-platform/reusable-components';
import { InterestedButton } from '../../main-platform/community/components/MeetTheGreeks';

import { MessageType, LikeUpdateType } from '../../helpers/types';
import { makeRequest, cropText } from '../../helpers/functions';
import { HEADER_HEIGHT } from '../../helpers/constants';
import Theme from '../../theme/Theme';

const MAX_MESSAGES = 40;

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    width: '350px',
    display: 'flex',
    flexDirection: 'column',
  },
  messageContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    background: Theme.background,
    overflow: 'scroll',
  },
  viewerButtonContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-center',
    padding: 10,
    backgroundColor: Theme.background,
  },
  viewerButtons: {
    marginLeft: 10,
    marginRight: 10,
  },
}));

type Props = {
  user: { [key: string]: any };
  conversationID: string;
  accessToken: string;
  refreshToken: string;
  newMessage: MessageType;
  messageSocket: SocketIOClient.Socket;
  isHost?: boolean;
  webinarID: string;

  onRequestToSpeak?: () => void;
  communityID?: string;
};

function EventMessageContainer(props: Props) {
  const styles = useStyles();

  const [messages, setMessages] = useState<MessageType[]>([]);
  const [height, setHeight] = useState(window.innerHeight - HEADER_HEIGHT);
  const [likeUpdate, setLikeUpdate] = useState<LikeUpdateType>();

  const [transition, setTransition] = useState<any>();
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarMode, setSnackbarMode] = useState<
    'success' | 'error' | 'notify' | null
  >(null);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  useEffect(() => {
    updateLikes();
  }, [likeUpdate]);

  useEffect(() => {
    if (
      Object.keys(props.messageSocket).length === 0 ||
      props.conversationID === '' ||
      props.conversationID === undefined ||
      props.user === undefined
    )
      return;
    fetchMessages();
  }, [props.messageSocket, props.conversationID, props.user]);

  useEffect(() => {
    if (
      Object.keys(props.messageSocket).length === 0 ||
      props.conversationID === '' ||
      props.conversationID === undefined
    )
      return;

    props.messageSocket.emit('connectToConversation', props.conversationID);
    props.messageSocket.on('updateLikes', (messageData: any) => {
      setLikeUpdate(messageData);
    });
  }, [props.messageSocket, props.conversationID]);

  useEffect(() => {
    handleNewMessage(props.newMessage);
  }, [props.newMessage]);

  function updateLikes() {
    if (likeUpdate === undefined) return;

    setMessages((prevMessages) => {
      let newMessages = prevMessages.slice();
      newMessages.forEach((message) => {
        if (message._id === likeUpdate.messageID) {
          message.numLikes = likeUpdate.numLikes;
          if (
            message.sender === props.user._id &&
            likeUpdate.liker !== props.user._id &&
            likeUpdate.liked
          ) {
            setSnackbarMode('success');
            setSnackbarMessage(
              `${likeUpdate.likerName} liked your message: "${cropText(
                message.content,
                20
              )}"`
            );
            setTransition(() => slideLeft);
          }
        }
      });
      return newMessages;
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
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].tempID === newMessage.tempID) {
          let newMessages = messages.slice();
          newMessages[i] = newMessage;
          setMessages(newMessages);
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
    const tempID = new Date().toISOString();
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

    if (data['success'] !== 1 && data['content']['tempID'])
      addMessageErr(data['content']['tempID']);
  }

  async function handleRemoveUser(userID: string) {
    const { data } = await makeRequest(
      'POST',
      '/proxy/webinar/removeViewerFromStream',
      { userID, webinarID: props.webinarID },
      true,
      props.accessToken,
      props.refreshToken
    );

    return data.success;
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
            isHost={props.isHost}
            handleRemoveUser={handleRemoveUser}
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

  function renderViewerButtons() {
    if (!props.onRequestToSpeak && !props.communityID) return;

    return (
      <div className={styles.viewerButtonContainer}>
        <RSButton onClick={props.onRequestToSpeak} className={styles.viewerButtons}>
          Request to Speak
        </RSButton>
        {props.communityID && (
          <InterestedButton
            className={styles.viewerButtons}
            communityID={props.communityID!}
          />
        )}
      </div>
    );
  }

  function scrollToBottom() {
    const eventMessageContainer = document.getElementById('eventMessageContainer');
    eventMessageContainer?.scrollTo(0, eventMessageContainer?.scrollHeight);
  }

  function slideLeft(props: TransitionProps) {
    return <Slide {...props} direction="left" />;
  }

  return (
    <div className={styles.wrapper} style={{ height: height }}>
      <ManageSpeakersSnackbar
        message={snackbarMessage}
        transition={transition}
        mode={snackbarMode}
        handleClose={() => setSnackbarMode(null)}
      />
      <div id="eventMessageContainer" className={styles.messageContainer}>
        {renderMessages()}
      </div>

      <EventMessageTextField handleSendMessage={handleSendMessage} />
      {renderViewerButtons()}
    </div>
  );
}

const mapStateToProps = (state: { [key: string]: any }) => {
  return {
    user: state.user,
    accessToken: state.accessToken,
    refreshToken: state.refreshToken,
    newMessage: state.newMessage,
    messageSocket: state.messageSocket,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(EventMessageContainer);
