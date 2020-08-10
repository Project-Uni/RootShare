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
  IconButton,
  CircularProgress,
  Slide,
} from '@material-ui/core';
import Paper, { PaperProps } from '@material-ui/core/Paper';
import { Autocomplete } from '@material-ui/lab';
import { TransitionProps } from '@material-ui/core/transitions';

import Draggable from 'react-draggable';

import { IoMdClose } from 'react-icons/io';

import { connect } from 'react-redux';

import { colors } from '../../../theme/Colors';
import { makeRequest } from '../../../helpers/functions';
import RSText from '../../../base-components/RSText';
import ManageSpeakersSnackbar from './ManageSpeakersSnackbar';

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
  textField: {
    background: colors.primaryText,
  },
  bright: {
    color: colors.bright,
    marginBottom: 6,
  },
  selectedName: {
    marginBottom: 3,
  },
  loadingDiv: {
    display: 'flex',
    justifyContent: 'center',
  },
  loadingIndicator: {
    color: colors.primaryText,
  },
}));

type UserInfo = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  connection?: OT.Connection;
};

type Props = {
  open: boolean;
  webinarID: string;
  onCancel: () => void;
  onAdd: (user: { [key: string]: any }) => void;
  accessToken: string;
  refreshToken: string;
  removeGuestSpeaker: (connection: OT.Connection) => void;
};

function ManageSpeakersDialog(props: Props) {
  const styles = useStyles();

  const [loading, setLoading] = useState(true);
  const [searchedUser, setSearchedUser] = useState<UserInfo>();
  const [options, setOptions] = useState<UserInfo[]>([]);
  const [searchErr, setSearchedErr] = useState('');
  const [serverErr, setServerErr] = useState('');

  const [currentSpeaker, setCurrentSpeaker] = useState<UserInfo>();

  const [snackbarMode, setSnackbarMode] = useState<
    'success' | 'error' | 'notify' | null
  >(null);
  const [transition, setTransition] = useState<any>();
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    if (props.open) {
      fetchData();
      setServerErr('');
    }
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
      if (data['content']['currentSpeaker']) {
        setCurrentSpeaker(data['content']['currentSpeaker']);
      } else {
        setCurrentSpeaker(undefined);
      }
    }
    setLoading(false);
  }

  function slideLeft(props: TransitionProps) {
    return <Slide {...props} direction="left" />;
  }

  function handleSnackbarClose() {
    setSnackbarMode(null);
  }

  async function onAddClick() {
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
      if (data.success === 1) {
        const guestSpeaker = { ...searchedUser };
        props.onAdd(guestSpeaker);

        setSnackbarMode('success');
        setTransition(() => slideLeft);
        setSnackbarMessage('Successfully invited user to speak.');

        setSearchedUser(undefined);
        setServerErr('');
      } else {
        setServerErr('There was an error inviting this user');
      }
    } else {
      setSearchedErr('Please enter a valid user');
    }
  }

  function handleAutocompleteChange(_: any, newSpeaker: any) {
    setSearchedUser(newSpeaker);
  }

  async function handleRemoveSpeaker() {
    if (
      window.confirm(
        `Are you sure you want to remove ${currentSpeaker!.firstName} ${
          currentSpeaker!.lastName
        } from the stream?`
      )
    ) {
      const { data } = await makeRequest(
        'POST',
        '/proxy/webinar/removeGuestSpeaker',
        {
          webinarID: props.webinarID,
        },
        true,
        props.accessToken,
        props.refreshToken
      );

      if (data['success'] === 1 && currentSpeaker?.connection?.connectionId) {
        props.removeGuestSpeaker(currentSpeaker?.connection!);

        setSnackbarMode('notify');
        setTransition(() => slideLeft);
        setSnackbarMessage('Successfully removed speaker.');

        setCurrentSpeaker(undefined);
        setServerErr('');
      } else {
        setServerErr('There was an error trying to remove the speaker');
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
            className={styles.textField}
          />
        )}
      />
    );
  }

  function renderCurrentSpeaker() {
    return (
      <>
        <RSText className={styles.bright}>
          <b>Current Speaker</b>
        </RSText>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <RSText className={[styles.text, styles.selectedName].join(' ')}>
            {currentSpeaker?.firstName} {currentSpeaker?.lastName}
          </RSText>
          <IconButton onClick={handleRemoveSpeaker}>
            <IoMdClose color={colors.secondaryText} />
          </IconButton>
        </div>

        <RSText className={styles.text}>{currentSpeaker?.email}</RSText>
      </>
    );
  }

  function renderSelectedUserInfo() {
    return (
      <div style={{ marginBottom: 15 }}>
        <RSText className={styles.bright}>
          <b>Selected User</b>
        </RSText>
        <RSText className={[styles.text, styles.selectedName].join(' ')}>
          {searchedUser?.firstName} {searchedUser?.lastName}
        </RSText>
        <RSText className={styles.text}>{searchedUser?.email}</RSText>
      </div>
    );
  }

  return (
    <>
      <ManageSpeakersSnackbar
        message={snackbarMessage}
        transition={transition}
        mode={snackbarMode}
        handleClose={handleSnackbarClose}
      />
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
          {loading ? (
            <div className={styles.loadingDiv}>
              <CircularProgress size={50} className={styles.loadingIndicator} />
            </div>
          ) : (
            <>
              {searchedUser && renderSelectedUserInfo()}
              {currentSpeaker ? renderCurrentSpeaker() : renderAutoComplete()}
              {serverErr && (
                <RSText type="body" color={'red'} size={11} italic>
                  {serverErr}
                </RSText>
              )}
              <RSText type="body" color={colors.secondaryText}>
                {options.length} Active Viewer{options.length !== 1 && 's'}
              </RSText>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            autoFocus
            onClick={props.onCancel}
            className={styles.secondaryText}
          >
            Cancel
          </Button>
          {!currentSpeaker && (
            <Button onClick={onAddClick} className={styles.text} disabled={loading}>
              Add User
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
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
