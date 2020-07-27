import React, { useState } from 'react';
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
}));

type UserInfo = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
};

type Props = {
  open: boolean;
  onCancel: () => void;
  onAdd: (user: { [key: string]: any }) => void;
  accessToken: string;
  refreshToken: string;
};

function ManageSpeakersDialog(props: Props) {
  const styles = useStyles();
  const [searchedUser, setSearchedUser] = useState<UserInfo>();
  const [options, setOptions] = useState<UserInfo[]>([]);
  const [searchErr, setSearchedErr] = useState('');

  function onAddClick() {
    console.log('Searched User:', searchedUser);
    if (searchedUser) {
      props.onAdd(searchedUser);
    } else {
      setSearchedErr('Please enter a valid user');
    }
  }

  function handleAutocompleteChange(_: any, newSpeaker: any) {
    console.log('New Speaker:', newSpeaker);
    setSearchedUser(newSpeaker);
  }

  async function handleQueryChange(event: any) {
    if (event.target.value.length >= 3) {
      const { data } = await makeRequest(
        'POST',
        //TODO - Change this to a route that only searches among users in the webinar
        '/api/getMatchingUsers',
        {
          query: event.target.value,
        },
        true,
        props.accessToken,
        props.refreshToken
      );
      if (data['success'] === 1) {
        setOptions(data['content']['users']);
      }
    }
  }

  function renderAutoComplete() {
    return (
      <Autocomplete
        style={{ width: 400, marginBottom: '20px' }}
        options={options}
        getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
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
            onChange={handleQueryChange}
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
