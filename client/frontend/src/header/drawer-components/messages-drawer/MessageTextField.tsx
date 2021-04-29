import React, { useState, useEffect } from 'react';

import { TextField, IconButton, Modal } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { MdSend } from 'react-icons/md';
import { FaRegSmile } from 'react-icons/fa';
import 'emoji-mart/css/emoji-mart.css';
import { Picker } from 'emoji-mart';

import { colors } from '../../../theme/Colors';
import { ENTER_KEYCODE } from '../../../helpers/constants';
import Theme from '../../../theme/Theme';

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
  textFieldContainer: {
    display: 'flex',
    width: '100%',
    justifyContent: 'space-between',
    borderTop: `1px solid ${Theme.primary}`,
    color: Theme.dark,
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 5,
  },
  textField: {
    [`& fieldset`]: {
      borderRadius: 40,
    },
    width: '100%',
    color: Theme.dark,
    label: Theme.dark,
    borderRadius: 40,
  },
  cssLabel: {
    color: Theme.dark,
    label: Theme.dark,
  },
  cssFocused: {
    color: Theme.dark,
    label: Theme.dark,
    borderWidth: '1px',
    borderColor: `${Theme.dark} !important`,
  },
  cssOutlinedInput: {
    '&$cssFocused $notchedOutline': {
      // color: '#f2f2f2 !important',
      // label: '#f2f2f2 !important',
      borderWidth: '2px',
      borderColor: `${Theme.dark} !important`,
    },
  },
  notchedOutline: {
    borderWidth: '1px',
    label: Theme.primaryText,
    borderColor: Theme.primaryText,
    color: Theme.primaryText,
  },
  paper: {
    width: 270,
  },
  icon: {
    color: Theme.primary,
    '&:hover': {
      color: Theme.bright,
    },
  },
}));

type Props = {
  handleSendMessage: (message: string) => void;
  sendingDisabled: boolean;
};

function MessageTextField(props: Props) {
  const styles = useStyles();

  const [newMessage, setNewMessage] = useState('');
  const [modalStyle, setModalStyle] = useState(getModalStyle);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
  }, []);

  function handleMessageChange(event: any) {
    setNewMessage(event.target.value);
  }

  function handleSendMessage() {
    props.handleSendMessage(newMessage);
    setNewMessage('');
  }

  function handleMessageKey(event: any) {
    if (event.keyCode === ENTER_KEYCODE) {
      event.preventDefault();
      if (!getSendingDisabled()) handleSendMessage();
    }
  }

  function renderEmojiPicker() {
    return (
      <div style={modalStyle} className={styles.paper}>
        <Picker
          set="apple"
          onSelect={onEmojiClick}
          title="Spice it up"
          perLine={7}
          theme="light"
          showPreview={false}
          sheetSize={64}
          emoji=""
        />
      </div>
    );
  }

  function onEmojiClick(emoji: { [key: string]: any }) {
    const updateMessage = newMessage + emoji.native + ' ';
    setNewMessage(updateMessage);
  }

  function getModalStyle() {
    const bottom = 100;
    const right = 50;
    const containerWidth = 270;
    const containerHeight = 400;
    return {
      bottom,
      right,
      transform: `translate(${window.innerWidth -
        containerWidth -
        right}px, ${window.innerHeight - containerHeight - bottom}px)`,
    };
  }

  function handleResize() {
    setModalStyle(getModalStyle());
  }

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
      <IconButton
        aria-label="more"
        aria-controls="long-menu"
        aria-haspopup="true"
        onClick={() => setOpen(true)}
        className={styles.icon}
      >
        <FaRegSmile size={18}></FaRegSmile>
      </IconButton>
      <Modal open={open} onClose={() => setOpen(false)}>
        {renderEmojiPicker()}
      </Modal>
      <IconButton
        disabled={getSendingDisabled()}
        onClick={() => handleSendMessage()}
        className={styles.icon}
      >
        <MdSend
          style={{ color: getSendingDisabled() ? '#555555' : undefined }}
          size={20}
        />
      </IconButton>
    </div>
  );
}

export default MessageTextField;
