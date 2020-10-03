import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';

import { CircularProgress, IconButton } from '@material-ui/core';
import { IoIosArrowBack } from 'react-icons/io';

import SingleSelfMessage from './SingleSelfMessage';
import SingleOtherMessage from './SingleOtherMessage';
import MessageTextField from './MessageTextField';
import RSText from '../../../base-components/RSText';
import { colors } from '../../../theme/Colors';

import { updateCurrConversationID } from '../../../redux/actions/message';
import { makeRequest } from '../../../helpers/functions';
import { MessageType, ConversationType } from '../../../helpers/types';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  headerParticipants: {
    justifyContent: 'center',
    wordWrap: 'break-word',
    maxWidth: 315,
    marginBottom: 20,
    marginTop: 20,
    margin: 'auto',
    color: colors.primaryText,
  },
  messagesContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
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
  loadingIndicator: {
    alignSelf: 'center',
    marginTop: 40,
    color: colors.secondaryText,
  },
}));

type Props = {
  user: any;
  conversation: ConversationType;
  messages: MessageType[];
  addMessage: (message: MessageType) => void;
  addMessageErr: (tempID: number) => void;
  returnToConversations: () => void;
  accessToken: string;
  refreshToken: string;
  updateCurrConversationID: (currConversationID: string) => void;
};

function MessageThreadContainer(props: Props) {
  const styles = useStyles();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return () => {
      props.updateCurrConversationID('');
    };
  }, []);

  useEffect(() => {
    if (props.messages && props.messages.length > 0) setLoading(false);
  }, [props.messages]);

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
          <SingleSelfMessage
            key={message._id || message.tempID}
            user={props.user}
            message={message}
          />
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

    output.push(<div id="scrollDummyItem" />);
    return output;
  }

  async function handleSendMessage(message: string) {
    const tempID = new Date().toISOString();
    const newMessage = {
      conversationID: props.conversation._id,
      sender: props.user._id,
      senderName: `${props.user.firstName} ${props.user.lastName}`,
      content: message,
      createdAt: new Date(),
      tempID: tempID,
    };
    props.addMessage(newMessage as MessageType);

    const { data } = await makeRequest(
      'POST',
      '/api/messaging/sendMessage',
      {
        conversationID: props.conversation._id,
        message: message,
        tempID,
      },
      true,
      props.accessToken,
      props.refreshToken
    );

    if (data['success'] !== 1 && data['content']['tempID'])
      props.addMessageErr(data['content']['tempID']);
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
    setTimeout(() => {
      const scrollDummyItem = document.getElementById('scrollDummyItem');
      scrollDummyItem?.scrollIntoView({ behavior: 'smooth' });
    });
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
      <div className={styles.messagesContainer}>
        {loading ? (
          <CircularProgress
            className={styles.loadingIndicator}
            size={75}
            thickness={2}
          />
        ) : (
          renderLatestMessages()
        )}
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
  return {
    updateCurrConversationID: (currConversationID: string) => {
      dispatch(updateCurrConversationID(currConversationID));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MessageThreadContainer);
