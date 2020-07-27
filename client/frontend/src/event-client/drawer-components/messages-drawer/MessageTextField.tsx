import React, { useState } from 'react';

import { TextField, IconButton } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { MdSend } from 'react-icons/md';
import { FaRegSmile } from 'react-icons/fa';

import { colors } from '../../../theme/Colors';
import { ENTER_KEYCODE } from '../../../helpers/constants';

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
  textFieldContainer: {
    display: 'flex',
    width: '100%',
    justifyContent: 'space-between',
    borderTop: '1px solid #333333',
    color: '#f2f2f2',
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 5,
  },
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
  cssOutlinedInput: {
    '&$cssFocused $notchedOutline': {
      // color: '#f2f2f2 !important',
      // label: '#f2f2f2 !important',
      borderWidth: '2px',
      borderColor: '#f2f2f2 !important',
    },
  },
  notchedOutline: {
    borderWidth: '1px',
    label: colors.primaryText,
    borderColor: colors.primaryText,
    color: colors.primaryText,
  },
}));

type Props = {
  handleSendMessage: (message: string) => void;
  sendingDisabled: boolean;
};

function MessageTextField(props: Props) {
  const styles = useStyles();

  const [newMessage, setNewMessage] = useState('');

  function handleMessageChange(event: any) {
    setNewMessage(event.target.value);
  }

  function handleMessageKey(event: any) {
    if (event.keyCode === ENTER_KEYCODE) {
      event.preventDefault();
      if (!getSendingDisabled()) props.handleSendMessage(newMessage);
    }
  }

  function handleEmojiClick() {}

  function getSendingDisabled() {
    return (
      props.sendingDisabled ||
      newMessage === undefined ||
      newMessage === null ||
      newMessage === ''
    );
  }

  return (
    <div className={styles.textFieldContainer}>
      <TextField
        multiline
        type="search"
        label="Aa"
        variant="outlined"
        size="small"
        className={styles.textField}
        onChange={handleMessageChange}
        onKeyDown={handleMessageKey}
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
            notchedOutline: styles.notchedOutline,
          },
          inputMode: 'numeric',
        }}
      />
      <IconButton onClick={handleEmojiClick}>
        <FaRegSmile size={18} color="#f2f2f2" />
      </IconButton>
      <IconButton
        disabled={getSendingDisabled()}
        onClick={() => props.handleSendMessage(newMessage)}
      >
        <MdSend color={getSendingDisabled() ? '#555555' : '#f2f2f2'} size={20} />
      </IconButton>
    </div>
  );
}

export default MessageTextField;
