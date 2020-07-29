import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from '@material-ui/core';
import Paper, { PaperProps } from '@material-ui/core/Paper';
import { Autocomplete } from '@material-ui/lab';
import Draggable from 'react-draggable';

import { connect } from 'react-redux';

import { colors } from '../../../theme/Colors';
import { makeRequest } from '../../../helpers/makeRequest';

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
  paper: {
    background: colors.secondary,
  },
  secondaryText: {
    color: colors.secondaryText,
  },
  text: {
    color: colors.primaryText,
  },
  // cssLabel: {
  //   color: colors.primaryText,
  //   label: colors.primaryText,
  // },
  // cssFocused: {
  //   color: colors.primaryText,
  //   label: colors.primaryText,
  //   borderColor: colors.primaryText,
  // },
  // cssOutlinedInput: {
  //   '&$cssFocused $notchedOutline': {
  //     color: colors.primaryText,
  //     label: colors.primaryText,
  //     borderColor: colors.primaryText,
  //   },
  // },
  // notchedOutline: {
  //   label: colors.primaryText,
  //   borderColor: colors.primaryText,
  //   color: colors.primaryText,
  // },
}));

type UserInfo = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
};

type Props = {
  open: boolean;
  webinarID: string;
  onCancel: () => void;
  onAdd: (user: { [key: string]: any }) => void;
  accessToken: string;
  refreshToken: string;
};

function ManageSpeakersDialog(props: Props) {
  const styles = useStyles();

  const [loading, setLoading] = useState(true);
  const [searchedUser, setSearchedUser] = useState<UserInfo>();
  const [options, setOptions] = useState<UserInfo[]>([]);
  const [searchErr, setSearchedErr] = useState('');

  useEffect(() => {
    if (props.open) fetchData();
  }, [props.open]);

  async function fetchData() {
    const { data } = await makeRequest(
      'GET',
      `/api/webinar/${props.webinarID}/getActiveViewers`,
      {},
      true,
      props.accessToken,
      props.refreshToken
    );
    if (data['success'] === 1) {
      setOptions(data['content']['users']);
    }
    setLoading(false);
  }

  async function onAddClick() {
    console.log('Searched User:', searchedUser);
    if (searchedUser) {
      const { data } = await makeRequest(
        'POST',
        '/proxy/webinar/inviteUserToSpeak',
        {
          userID: searchedUser._id,
          webinarID: props.webinarID,
        },
        true,
        props.accessToken,
        props.refreshToken
      );
      console.log('Data:', data);
      // props.onAdd(searchedUser);
    } else {
      setSearchedErr('Please enter a valid user');
    }
  }

  function handleAutocompleteChange(_: any, newSpeaker: any) {
    console.log('New Speaker:', newSpeaker);
    setSearchedUser(newSpeaker);
  }

  function renderAutoComplete() {
    return (
      <Autocomplete
        style={{ width: 400, marginBottom: '20px' }}
        options={options}
        getOptionLabel={(option) =>
          `${option.firstName} ${option.lastName} | ${option.email}`
        }
        onChange={handleAutocompleteChange}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Find a user"
            variant="outlined"
            fullWidth
            value={searchedUser}
            error={searchErr !== ''}
            helperText={searchErr}
            // InputLabelProps={{
            //   classes: {
            //     root: styles.cssLabel,
            //     focused: styles.cssFocused,
            //   },
            // }}
            // InputProps={{
            //   classes: {
            //     root: styles.cssOutlinedInput,
            //     focused: styles.cssFocused,
            //     notchedOutline: styles.notchedOutline,
            //   },
            // }}
          />
        )}
      />
    );
  }

  return (
    <Dialog open={props.open} onClose={() => {}} PaperComponent={PaperComponent}>
      <DialogTitle
        style={{ cursor: 'move' }}
        id="draggable-title"
        className={styles.text}
      >
        Manage Event Speakers
      </DialogTitle>
      <DialogContent>
        <DialogContentText className={styles.text}>
          Enter a user to bring on as a guest speaker
        </DialogContentText>
        {renderAutoComplete()}
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={props.onCancel} className={styles.secondaryText}>
          Cancel
        </Button>
        <Button onClick={onAddClick} className={styles.text}>
          Add User
        </Button>
      </DialogActions>
    </Dialog>
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

export default connect(mapStateToProps, mapDispatchToProps)(ManageSpeakersDialog);

function PaperComponent(props: PaperProps) {
  const styles = useStyles();
  return (
    <Draggable
      // handle="#draggable-title"
      cancel={'[class*="MuiDialogContent-root"]'}
    >
      <Paper {...props} className={styles.paper} square={false} />
    </Draggable>
  );
}
