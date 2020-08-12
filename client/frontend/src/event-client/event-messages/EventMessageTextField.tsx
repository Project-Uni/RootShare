import React, { useState, useEffect } from 'react';

import { TextField, IconButton, Modal } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { MdSend } from 'react-icons/md';
import { FaRegSmile } from 'react-icons/fa';
import 'emoji-mart/css/emoji-mart.css';
import { Picker } from 'emoji-mart';

import { colors } from '../../theme/Colors';
import { ENTER_KEYCODE } from '../../helpers/constants';

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
  textFieldContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    background: colors.secondary,
    color: colors.primaryText,
    borderTopStyle: 'solid',
    borderTopWidth: 1,
    borderTopColor: 'lightgray',
  },
  textField: {
    width: 250,
    background: colors.ternary,
    color: colors.primaryText,
    label: colors.primaryText,
  },
  cssLabel: {
    color: colors.primaryText,
    label: colors.primaryText,
  },
  cssFocused: {
    color: colors.primaryText,
    label: colors.primaryText,
    borderWidth: '2px',
    borderColor: colors.primaryText,
    shrink: false,
  },
  cssOutlinedInput: {
    '&$cssFocused $notchedOutline': {
      color: colors.primaryText,
      label: colors.primaryText,
      borderWidth: '2px',
      borderColor: colors.primaryText,
    },
  },
  notchedOutline: {
    borderWidth: '1px',
    label: colors.primaryText,
    borderColor: colors.primaryText,
    color: colors.primaryText,
  },
  paper: {
    width: 270,
  },
  icon: {
    color: colors.primaryText,
    '&:hover': {
      color: colors.bright,
    },
  },
}));

type Props = {
  handleSendMessage: (message: string) => void;
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
          theme="dark"
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
    return newMessage === undefined || newMessage === null || newMessage === '';
  }

  return (
    <div className={styles.textFieldContainer}>
      <TextField
        multiline
        type="search"
        label="Aa"
        variant="outlined"
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
            // notchedOutline: styles.notchedOutline,
          },
        }}
      />
      <div>
        <IconButton
          aria-label="more"
          aria-controls="long-menu"
          aria-haspopup="true"
          onClick={() => setOpen(true)}
        >
          <FaRegSmile size={24} className={styles.icon}></FaRegSmile>
        </IconButton>
        <Modal open={open} onClose={() => setOpen(false)}>
          {renderEmojiPicker()}
        </Modal>
        <IconButton
          className={styles.icon}
          onClick={handleSendMessage}
          disabled={getSendingDisabled()}
        >
          <MdSend
            size={20}
            style={{ color: getSendingDisabled() ? '#555555' : undefined }}
          />
        </IconButton>
      </div>
    </div>
  );
}

export default MessageTextField;
