import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { makeStyles } from '@material-ui/core/styles';
import axios from 'axios';
import { connect } from 'react-redux';

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

type Props = {
  user: { [key: string]: any };
};

function MessagesDrawerContainer(props: Props) {
  const styles = useStyles();

  const [socket, setSocket] = useState<SocketIOClient.Socket>();
  const [setup, setSetup] = useState(false);
  const [conversations, setConversations] = useState<any>([]);
  const [currConversationID, setCurrConversationID] = useState('');
  const [currConversation, setCurrConversation] = useState({});
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState({});
  const [newConversation, setNewConversation] = useState({});

  useEffect(() => {
    if (setup) return;
    setSetup(true);

    connectSocket();
  }, []);

  useEffect(() => {
    addMessage(newMessage);
  }, [newMessage]);

  useEffect(() => {
    updateConversations(newConversation);
  }, [newConversation]);

  function connectSocket() {
    const socket = io('http://localhost:8080');
    setSocket(socket);

    socket.on('connect', (data: React.SetStateAction<boolean>) => {
      fetchConversations(socket);
    });

    socket.on('newMessage', (message: any) => {
      setNewMessage(message);
    });

    socket.on('newConversation', (conversation: any) => {
      addConversation(socket, conversation);
    });

    socket.on('error', function(err: any) {
      console.log(`Received socket error: ${err}`);
    });
  }

  function addMessage(newMessage: any) {
    setConversations((prevConversations: any[]) => {
      for (let i = 0; i < prevConversations.length; i++) {
        if (prevConversations[i]._id === newMessage.conversationID) {
          const updatedConversation = prevConversations[i];
          updatedConversation.lastMessage = newMessage;
          return [updatedConversation].concat(
            prevConversations
              .slice(0, i)
              .concat(prevConversations.slice(i + 1, prevConversations.length))
          );
        }
      }

      return prevConversations;
    });

    if (currConversationID !== '')
      setMessages((prevMessages) => prevMessages.concat(newMessage));
  }

  function addConversation(currSocket: SocketIOClient.Socket, newConversation: any) {
    currSocket.emit('connectToConversation', newConversation._id);
    setNewConversation(newConversation);
  }

  function updateConversations(newConversation: any) {
    if (
      Object.keys(newConversation).length === 0 ||
      newConversation === undefined ||
      newConversation === null
    )
      return;

    setConversations((prevConversations: any[]) =>
      [newConversation].concat(prevConversations)
    );
  }

  function fetchConversations(currSocket: SocketIOClient.Socket) {
    if (currSocket === undefined && socket !== undefined) currSocket = socket;
    axios
      .get('/api/messaging/getLatestThreads')
      .then((response) => {
        if (response.data.success !== 1) return;

        const userConversations = response.data.content.userConversations;
        if (currSocket !== undefined) {
          currSocket.emit('metadata', userConversations, props.user._id);
        }
        setConversations(userConversations);
      })
      .catch((err) => {
        console.log('error', 'Failed to get Conversations');
      });
  }

  function updateMessages(currID: string = currConversationID) {
    axios
      .post('/api/messaging/getLatestMessages', {
        conversationID: currID,
      })
      .then((response) => {
        if (response.data.success !== 1) return;

        const messages = response.data.content.messages;
        setMessages(messages);
      })
      .catch((err) => {
        console.log('error', 'Failed to get Messages');
      });
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

  function joinUserNames(users: any, delimiter: string) {
    let joinedString = '';

    for (let i = 0; i < users.length; i++) {
      const currUser = users[i];
      const currName = currUser.firstName;

      let firstFlag = false;
      if (firstFlag) joinedString += delimiter;
      if (currUser._id !== props.user._id) {
        joinedString += currName;
        firstFlag = true;
      }
    }

    return joinedString;
  }

  return (
    <div className={styles.wrapper}>
      {currConversationID === '' ? (
        <AllConversationsContainer
          user={props.user}
          conversations={conversations}
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
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(MessagesDrawerContainer);
