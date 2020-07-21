import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { makeStyles } from '@material-ui/core/styles';

import { connect } from 'react-redux';
import { makeRequest } from '../../../helpers/makeRequest';

import AllConversationsContainer from './AllConversationsContainer';
import MessageThreadContainer from './MessageThreadContainer';

import { colors } from '../../../theme/Colors';

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
  newMessage: string;
};

function MessagesDrawerContainer(props: Props) {
  const styles = useStyles();

  const [currConversationID, setCurrConversationID] = useState('');
  const [currConversation, setCurrConversation] = useState({});
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    addMessage(props.newMessage);
  }, [props.newMessage]);

  function addMessage(newMessage: any) {
    if (currConversationID !== '')
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
    setCurrConversation({});
    setMessages([]);
  }

  return (
    <div className={styles.wrapper}>
      {currConversationID === '' ? (
        <AllConversationsContainer
          user={props.user}
          selectConversation={selectConversation}
        />
      ) : (
        <MessageThreadContainer
          user={props.user}
          conversation={currConversation}
          messages={messages}
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
