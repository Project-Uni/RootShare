import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';

import { updateCurrConversationID } from '../../../redux/actions/message';
import { makeRequest } from '../../../helpers/functions';

import AllConversationsContainer from './AllConversationsContainer';
import MessageThreadContainer from './MessageThreadContainer';

import { colors } from '../../../theme/Colors';
import { MessageType, ConversationType } from '../../../helpers/types';
import Theme from '../../../theme/Theme';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    width: '350px',
    display: 'flex',
    flexDirection: 'column',
    height: window.innerHeight,
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    // background: "white",
    overflow: 'scroll',
    label: Theme.dark,
  },
  textFieldContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    background: Theme.white,
    borderTop: '2px solid ' + Theme.primaryText,
    color: Theme.primaryText,
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 5,
  },
  connectionContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    background: Theme.white,
    overflow: 'scroll',
    label: Theme.primaryText,
  },
}));

// TODO - Add loading indicator to messages
// TODO - Make self messages and conversations update without socket notification
type Props = {
  user: { [key: string]: any };
  accessToken: string;
  refreshToken: string;
  newMessage: MessageType;
  currConversationID: string;
  updateCurrConversationID: (currConversationID: string) => void;
};

function MessagesDrawerContainer(props: Props) {
  const styles = useStyles();

  const [currConversation, setCurrConversation] = useState<ConversationType>();
  const [messages, setMessages] = useState<MessageType[]>([]);

  useEffect(() => {
    handleNewMessage(props.newMessage);
  }, [props.newMessage]);

  function handleNewMessage(newMessage: MessageType) {
    if (
      Object.keys(newMessage).length === 0 ||
      !newMessage ||
      newMessage.conversationID !== props.currConversationID
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

  async function updateMessages(currID: string = props.currConversationID) {
    const { data } = await makeRequest('POST', '/api/messaging/getLatestMessages', {
      conversationID: currID,
    });

    if (data['success'] !== 1) return;
    const messages = data['content']['messages'];
    setMessages(messages);
  }

  function selectConversation(conversation: any) {
    setCurrConversation(conversation);
    updateMessages(conversation._id);
    props.updateCurrConversationID(conversation._id);
  }

  function returnToConversations() {
    props.updateCurrConversationID('');
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
      {props.currConversationID === '' || currConversation === undefined ? (
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
    currConversationID: state.currConversationID,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    updateCurrConversationID: (currConversationID: string) => {
      dispatch(updateCurrConversationID(currConversationID));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MessagesDrawerContainer);
