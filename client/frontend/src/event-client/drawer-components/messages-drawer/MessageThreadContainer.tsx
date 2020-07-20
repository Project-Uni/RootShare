import React, { useState, useEffect } from 'react';
import axios from 'axios';

import { TextField, IconButton } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { MdSend } from 'react-icons/md';
import { FaRegSmile } from 'react-icons/fa';
import { IoIosArrowBack } from 'react-icons/io';

import { connect } from 'react-redux';
import { makeRequest } from '../../../helpers/makeRequest';

import RSText from '../../../base-components/RSText';
import { colors } from '../../../theme/Colors';
import SingleSelfMessage from './SingleSelfMessage';
import SingleOtherMessage from './SingleOtherMessage';
import MessageTextField from './MessageTextField';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  headerParticipants: {
    display: 'flex',
    justifyContent: 'center',
    height: '25px',
    marginBottom: 20,
    marginTop: 20,
    margin: 'auto',
    color: colors.primaryText,
  },
  messagesContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    background: colors.secondary,
    overflow: 'scroll',
    // scrollbarWidth: 'thin', // don't work in most browsers
    // scrollbarColor: 'red',  // need to find workaround
    label: colors.primaryText,
    paddingTop: '10px',
    paddingBottom: 5,
    borderTopStyle: 'solid',
    borderTopColor: colors.primaryText,
    borderTopWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: colors.primaryText,
    borderBottomWidth: '1px',
    marginTop: '-2px',
  },
  header: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
  },
  arrow: {
    marginLeft: -10,
  },
  filler: {
    color: colors.secondary,
  },
  textFieldContainer: {
    display: 'flex',
    width: '100%',
    justifyContent: 'space-between',
    background: '#333333',
    borderTop: '1px solid #333333',
    color: '#f2f2f2',
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 5,
  },
  textField: {
    width: '100%',
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
  notchedOutline: {
    borderWidth: '2px',
    label: colors.primaryText,
    borderColor: colors.primaryText,
    color: colors.primaryText,
  },
}));

type Props = {
  user: any;
  conversation: any;
  messages: any[];
  returnToConversations: () => void;
  accessToken: string;
  refreshToken: string;
};

function MessageThreadContainer(props: Props) {
  const styles = useStyles();

  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    scrollToBottom();
  }, [props.messages]);

  function renderLatestMessages() {
    let output: any[] = [];
    let lastSender = '';
    props.messages.forEach((message: any) => {
      let currSender = '';
      if (message.sender !== lastSender) {
        currSender = message.senderName;
        lastSender = message.sender;
      }

      output.push(
        props.user._id === message.sender ? (
          <SingleSelfMessage key={message._id} user={props.user} message={message} />
        ) : (
          <SingleOtherMessage
            key={message._id}
            user={props.user}
            message={message}
            senderName={currSender}
          />
        )
      );
    });

    return output;
  }

  function handleSendMessage(message: string) {
    makeRequest(
      'POST',
      '/api/messaging/sendMessage',
      { conversationID: props.conversation._id, message: message },
      true,
      props.accessToken,
      props.refreshToken
    );
  }

  function joinUserNames(users: any, delimiter: string) {
    let joinedString = '';

    let firstFlag = false;
    for (let i = 0; i < users.length; i++) {
      const currUser = users[i];
      const currName = currUser.firstName;

      if (currUser._id !== props.user._id) {
        if (firstFlag) joinedString += delimiter;
        joinedString += currName;
        firstFlag = true;
      }
    }

    return joinedString;
  }

  function scrollToBottom() {
    const messageContainer = document.getElementById('messageContainer');
    messageContainer?.scrollTo(0, messageContainer?.scrollHeight);
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <IconButton className={styles.arrow} onClick={props.returnToConversations}>
          <IoIosArrowBack size={32} color={colors.secondaryText} />
        </IconButton>
        <RSText bold size={16} className={styles.headerParticipants}>
          {joinUserNames(props.conversation.participants, ', ')}
        </RSText>
        <div className={styles.filler}>SAVE</div>
      </div>
      <div id="messageContainer" className={styles.messagesContainer}>
        {renderLatestMessages()}
      </div>

      <MessageTextField
        handleSendMessage={handleSendMessage}
        sendingDisabled={false}
      />
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

export default connect(mapStateToProps, mapDispatchToProps)(MessageThreadContainer);
