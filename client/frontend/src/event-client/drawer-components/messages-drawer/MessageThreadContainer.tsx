import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

import { TextField, IconButton } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { MdSend } from 'react-icons/md';
import { FaRegSmile } from 'react-icons/fa';

import RSText from '../../../base-components/RSText';
import { colors } from '../../../theme/Colors';
import SingleSelfMessage from './SingleSelfMessage';
import SingleOtherMessage from './SingleOtherMessage';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    height: window.innerHeight - 60,
  },
  messagesHeader: {
    height: '25px',
    marginBottom: 20,
    marginTop: 0,
    margin: 'auto',
    display: 'inline-block',
    color: colors.primaryText,
  },
  messagesContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    background: colors.secondary,
    overflow: 'scroll',
    label: colors.primaryText,
    paddingTop: '10px',
  },
  textFieldContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    background: '#333333',
    borderTop: '1px solid #333333',
    color: '#f2f2f2',
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 5,
  },
  textField: {
    width: 200,
    background: '#333333',
    color: '#f2f2f2',
    label: '#f2f2f2',
  },
  cssLabel: {
    color: '#f2f2f2',
    label: '#f2f2f2',
  },
  cssFocused: {
    color: '#f2f2f2',
    label: '#f2f2f2',
    borderWidth: '2px',
    borderColor: '#f2f2f2 !important',
  },
  cssOutlinedInput: {
    '&$cssFocused $notchedOutline': {
      color: '#f2f2f2 !important',
      label: '#f2f2f2 !important',
      borderWidth: '2px',
      borderColor: '#f2f2f2 !important',
    },
  },
}));

type Props = {
  user: any;
  conversation: any;
  messages: any[];
  returnToConversations: () => void;
};

function MessageThreadContainer(props: Props) {
  const styles = useStyles();

  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {}, []);

  function renderLatestMessages() {
    let output: any[] = [];
    props.messages.forEach((message: any) => {
      output.push(
        props.user._id === message.sender ? (
          <SingleSelfMessage key={message._id} user={props.user} message={message} />
        ) : (
          <SingleOtherMessage
            key={message._id}
            user={props.user}
            message={message}
          />
        )
      );
    });

    return output;
  }

  function handleMessageChange(event: any) {
    setNewMessage(event.target.value);
  }

  function handleSendMessage() {
    axios.post('/api/messaging/sendMessage', {
      conversationID: props.conversation._id,
      message: newMessage,
    });
    setNewMessage('');
  }

  function handleEmojiClick() {
    console.log('Clicked on emoji button');
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
      {/* <button onClick={props.returnToConversations}>Back</button> */}
      <RSText bold size={16} className={styles.messagesHeader}>
        {joinUserNames(props.conversation.participants, ', ')}
      </RSText>
      <div className={styles.messagesContainer}>{renderLatestMessages()}</div>

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

export default MessageThreadContainer;
