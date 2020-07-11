import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

import RSText from '../../../base-components/RSText';
import { TextField, IconButton } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { colors } from '../../../theme/Colors';
import { Autocomplete } from '@material-ui/lab';

import log from '../../../helpers/logger';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    width: '100%',
    display: 'flex',
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
    marginTop: '-2px',
  },
  autoComplete: {},
  textField: {
    [`& fieldset`]: {
      borderRadius: 40,
    },
    '& input::-webkit-clear-button': {
      display: 'none',
    },
    width: '100%',
    marginTop: 10,
    background: '#444444',
    color: '#f2f2f2',
    label: '#f2f2f2',
    borderStyle: 'solid',
    borderRadius: 40,
    height: 40,
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
  selectConversation: (conversation: any) => void;
  setNewConversation: (conversation: any) => void;
};

function CreateNewConversation(props: Props) {
  const styles = useStyles();

  const [connections, setConnections] = useState<any>([]);

  useEffect(() => {
    getConnections();
  }, []);

  function createNewThread() {}

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

  const CustomTextField = (
    <TextField
      type="search"
      label="Aa"
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
      InputProps={{
        classes: {
          root: styles.cssOutlinedInput,
          focused: styles.cssFocused,
        },
        inputMode: 'numeric',
      }}
    />
  );

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
          id="connectionAutoComplete"
          options={connections}
          getOptionLabel={(option: any) => `${option.firstName} ${option.lastName}`}
          className={styles.autoComplete}
          renderInput={(params) => (
            <TextField
              {...params}
              type="search"
              label="Aa"
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
    </div>
  );
}

export default CreateNewConversation;
