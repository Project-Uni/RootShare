import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { makeStyles } from '@material-ui/core/styles';

import { connect } from 'react-redux';
import { makeRequest } from '../helpers/makeRequest';
import { updateConversations, updateNewMessage } from '../redux/actions/message';

import { colors } from '../theme/Colors';
import { disconnect } from 'cluster';
import { MessageType, ConversationType } from '../types/messagingTypes';

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
}));

// TODO - Add loading indicator to messages
// TODO - Make self messages and conversations update without socket notification
type Props = {
  user: { [key: string]: any };
  accessToken: string;
  refreshToken: string;
  conversations: ConversationType[];
  newMessage: MessageType;
  updateConversations: (conversations: ConversationType[]) => void;
  updateNewMessage: (newMessage: MessageType) => void;
};

function SocketManager(props: Props) {
  const styles = useStyles();

  const [socket, setSocket] = useState<SocketIOClient.Socket>();
  const [newConversation, setNewConversation] = useState({});

  useEffect(() => {
    checkAuth((authed) => {
      if (authed) connectSocket();
      else disconnectSocket();
    });
  }, [props.user]);

  useEffect(() => {
    addMessage(props.newMessage);
  }, [props.newMessage]);

  useEffect(() => {
    updateConversations(newConversation);
  }, [newConversation]);

  async function checkAuth(callback: (authed: boolean) => void) {
    const { data } = await makeRequest(
      'GET',
      '/user/getCurrent',
      {},
      true,
      props.accessToken,
      props.refreshToken
    );

    callback(data['success'] === 1);
  }

  function connectSocket() {
    alert('connecting socket');
    const socket = io('http://localhost:8080');
    setSocket(socket);

    socket.on('connect', (data: React.SetStateAction<boolean>) => {
      fetchConversations(socket);
    });

    socket.on('newMessage', (message: any) => {
      props.updateNewMessage(message);
    });

    socket.on('newConversation', (conversation: any) => {
      addConversation(socket, conversation);
    });

    socket.on('error', function(err: any) {
      console.log(`Received socket error: ${err}`);
    });
  }

  function disconnectSocket() {
    setSocket((prevSocket) => {
      if (prevSocket !== undefined) prevSocket.disconnect();
      return undefined;
    });
  }

  function addMessage(newMessage: any) {
    if (
      Object.keys(newMessage).length === 0 ||
      newMessage === undefined ||
      newMessage === null
    )
      return;

    const prevConversations = props.conversations;
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

    props.updateConversations(prevConversations);
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

    props.updateConversations([newConversation].concat(props.conversations));
  }

  async function fetchConversations(currSocket: SocketIOClient.Socket) {
    if (currSocket === undefined && socket !== undefined) currSocket = socket;

    const { data } = await makeRequest(
      'GET',
      '/api/messaging/getLatestThreads',
      {},
      true,
      props.accessToken,
      props.refreshToken
    );
    if (data['success'] !== 1) return;

    const userConversations = data['content']['userConversations'];
    if (currSocket !== undefined)
      currSocket.emit('metadata', userConversations, props.user._id);

    props.updateConversations(userConversations);
  }

  return <span />;
}

const mapStateToProps = (state: { [key: string]: any }) => {
  return {
    user: state.user,
    accessToken: state.accessToken,
    refreshToken: state.refreshToken,
    conversations: state.conversations,
    newMessage: state.newMessage,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    updateConversations: (conversations: ConversationType[]) => {
      dispatch(updateConversations(conversations));
    },
    updateNewMessage: (newMessage: MessageType) => {
      dispatch(updateNewMessage(newMessage));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SocketManager);
