import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

import RSText from '../../../base-components/RSText';
import { TextField, IconButton } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { colors } from '../../../theme/Colors';
import { Autocomplete } from '@material-ui/lab';
import { MdSend } from 'react-icons/md';
import { FaRegSmile } from 'react-icons/fa';

import log from '../../../helpers/logger';
import MessageTextField from './MessageTextField';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    width: '100%',
    display: 'flex',
    overflow: 'hidden',
    flexDirection: 'column',
    height: '100%',
  },
  header: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
  },
  cancelButton: {},
  cancelText: {
    color: colors.primaryText,
  },
  conversationsTitle: {
    height: '25px',
    marginBottom: 20,
    marginTop: 20,
    margin: 'auto',
    display: 'inline-block',
    color: colors.primaryText,
  },
  filler: {
    color: colors.secondary,
  },
  searchBarContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    background: colors.secondary,
    overflow: 'scroll',
    label: colors.primaryText,
    borderTopStyle: 'solid',
    borderTopColor: colors.primaryText,
    borderTopWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: colors.primaryText,
    borderBottomWidth: '1px',
    marginTop: '-2px',
    paddingTop: 10,
  },
  autoComplete: {},
  option: {},
  textField: {
    [`& fieldset`]: {
      borderRadius: 40,
    },
    width: '100%',
    color: '#f2f2f2',
    label: '#f2f2f2',
    borderRadius: 40,
  },
  cssLabel: {
    color: '#f2f2f2',
    label: '#f2f2f2',
  },
  cssFocused: {
    color: '#f2f2f2',
    label: '#f2f2f2',
    borderWidth: '1px',
    borderColor: '#f2f2f2 !important',
  },
}));

// TODO - Make autocomplete dropdown look nicer
// TODO - If user creates duplicate conversation, use that one (like iMessage)
// TODO - ? Preload all connections into redux, so searches don't have to
//          query db every time
type Props = {
  user: any;
  selectConversation: (conversation: any) => void;
  setNewConversation: (conversation: any) => void;
};

function CreateNewConversation(props: Props) {
  const styles = useStyles();

  const [connections, setConnections] = useState<any>([]);
  const [newRecipients, setNewRecipients] = useState<any>([]);

  useEffect(() => {
    getConnections();
  }, []);

  function createNewThread() {}

  function handleMessageChange(event: any) {
    // setNewMessage(event.target.value);
  }

  function handleSendMessage(message: string) {
    setNewRecipients((prevRecipients: any) => {
      if (prevRecipients.length === 0 || message === '') return [];

      axios
        .post('/api/messaging/createThread', {
          recipients: prevRecipients,
          message: message,
        })
        .then((response) => {
          if (response.data.success === 1)
            props.selectConversation(response.data.content.currConversation);
        });

      return [];
    });
  }

  function handleEmojiClick() {
    console.log('Clicked on emoji button');
  }

  function handleRecipientChange(event: any, newValue: any[]) {
    let newList: any[] = [];
    newValue.forEach((user: any) => {
      newList.push(user._id);
    });

    setNewRecipients(newList);
  }

  // change this to get users' actual connections
  function getConnections() {
    axios
      .get('/user/getConnections')
      .then((response) => {
        if (response.data.success === 1)
          setConnections(response.data.content.connections);
      })
      .catch((err) => {
        log('error', err);
      });
  }

  function renderOption(option: any) {
    return (
      <div className={styles.option}>{`${option.firstName} ${option.lastName}`}</div>
    );
  }

  const listBoxProps = {};
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.filler}>***SAVE***</div>

        <RSText bold size={16} className={styles.conversationsTitle}>
          New Message
        </RSText>
        <IconButton
          className={styles.cancelButton}
          onClick={() => props.setNewConversation(false)}
        >
          <RSText size={12} className={styles.cancelText}>
            Cancel
          </RSText>
        </IconButton>
      </div>

      <div className={styles.searchBarContainer}>
        <Autocomplete
          multiple
          id="connectionAutoComplete"
          options={connections}
          onChange={handleRecipientChange}
          getOptionLabel={(option: any) => `${option.firstName} ${option.lastName}`}
          className={styles.autoComplete}
          ListboxProps={listBoxProps}
          renderOption={renderOption}
          renderInput={(params) => (
            <TextField
              {...params}
              type="search"
              label="Search Connections"
              variant="outlined"
              size="small"
              className={styles.textField}
              // onChange={handleMessageChange}
              // value={newMessage}
              InputLabelProps={{
                classes: {
                  root: styles.cssLabel,
                  focused: styles.cssFocused,
                },
              }}
              // InputProps={{
              //   classes: {
              //     // root: styles.cssOutlinedInput,
              //     // focused: styles.cssFocused,
              //   },
              //   // inputMode: 'numeric',
              // }}
            />
          )}
        />
      </div>

      <MessageTextField
        handleSendMessage={handleSendMessage}
        sendingDisabled={newRecipients.length === 0}
      />
    </div>
  );
}

export default CreateNewConversation;
