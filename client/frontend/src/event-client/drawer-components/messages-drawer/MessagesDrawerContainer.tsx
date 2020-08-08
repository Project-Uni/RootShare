import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { connect } from 'react-redux';
import { makeRequest } from '../../../helpers/functions';

import AllConversationsContainer from './AllConversationsContainer';
import MessageThreadContainer from './MessageThreadContainer';

import { colors } from '../../../theme/Colors';
import { MessageType, ConversationType } from '../../../helpers/types';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    width: '400px',
    display: 'flex',
    flexDirection: 'column',
    height: window.innerHeight,
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    // background: "white",
    overflow: 'scroll',
    label: '#f2f2f2',
  },
  textFieldContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    background: colors.primary,
    borderTop: '2px solid ' + colors.primaryText,
    color: colors.primaryText,
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 5,
  },
  connectionContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    background: colors.secondary,
    overflow: 'scroll',
    label: colors.primaryText,
  },
}));

// TODO - Add loading indicator to messages
// TODO - Make self messages and conversations update without socket notification
type Props = {
  user: { [key: string]: any };
  accessToken: string;
  refreshToken: string;
  newMessage: MessageType;
};

function MessagesDrawerContainer(props: Props) {
  const styles = useStyles();

  const [currConversationID, setCurrConversationID] = useState('');
  const [currConversation, setCurrConversation] = useState<ConversationType>();
  const [messages, setMessages] = useState<MessageType[]>([]);

  useEffect(() => {
    handleNewMessage(props.newMessage);
  }, [props.newMessage]);

  function handleNewMessage(newMessage: MessageType) {
    if (
      Object.keys(newMessage).length === 0 ||
      newMessage === undefined ||
      newMessage === null ||
      newMessage.conversationID !== currConversationID
    )
      return;

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
    setMessages((prevMessages) => prevMessages.concat(newMessage));
  }

  async function updateMessages(currID: string = currConversationID) {
    const { data } = await makeRequest(
      'POST',
      '/api/messaging/getLatestMessages',
      {
        conversationID: currID,
      },
      true,
      props.accessToken,
      props.refreshToken
    );

    if (data['success'] !== 1) return;
    const messages = data['content']['messages'];
    setMessages(messages);
  }

  function selectConversation(conversation: any) {
    setCurrConversation(conversation);
    updateMessages(conversation._id);
    setCurrConversationID(conversation._id);
  }

  function returnToConversations() {
    setCurrConversationID('');
    setCurrConversation(undefined);
    setMessages([]);
  }

  function addMessageErr(tempID: number) {
    setMessages((prevMessages) => {
      let newMessages = prevMessages.slice();
      newMessages[tempID].error = true;
      return newMessages;
    });
  }

  return (
    <div className={styles.wrapper}>
      {currConversationID === '' || currConversation === undefined ? (
        <AllConversationsContainer
          user={props.user}
          selectConversation={selectConversation}
        />
      ) : (
        <MessageThreadContainer
          user={props.user}
          conversation={currConversation}
          messages={messages}
          addMessage={addMessage}
          addMessageErr={addMessageErr}
          returnToConversations={returnToConversations}
        />
      )}
    </div>
  );
}

const mapStateToProps = (state: { [key: string]: any }) => {
  return {
    user: state.user,
    accessToken: state.accessToken,
    refreshToken: state.refreshToken,
    newMessage: state.newMessage,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(MessagesDrawerContainer);
