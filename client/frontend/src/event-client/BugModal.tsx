import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Slide,
} from '@material-ui/core';
import { Select, MenuItem } from '@material-ui/core';
import Draggable from 'react-draggable';
import Paper, { PaperProps } from '@material-ui/core/Paper';
import RSText from '../base-components/RSText';
import { colors } from '../theme/Colors';
import BugTextField from './BugTextField';
import { CircularProgress } from '@material-ui/core';

import ManageSpeakersSnackbar from '../../src/event-client/event-video/event-host/ManageSpeakersSnackbar';
import { TransitionProps } from '@material-ui/core/transitions';

import { makeRequest } from '../helpers/functions';
import { connect } from 'react-redux';

const useStyles = makeStyles((_: any) => ({
  paper: {
    background: colors.primaryText,
    width: 500,
    height: 400,
  },
  mobileText: {
    marginTop: 20,
  },
  okButton: {
    flex: 1,
    right: 7,
    bottom: 0,
    position: 'absolute',
    margin: 20,
    color: 'white',
    background: 'grey',
  },
  cancelButton: {
    flex: 1,
    right: 90,
    bottom: 0,
    position: 'absolute',
    margin: 20,
    color: 'white',
    background: 'grey',
  },
  select: {
    marginTop: 20,
    width: 450,
    background: 'white',
    color: 'black',
    label: 'black',
  },
  thankYou: {
    flex: 1,
    top: 0,
    position: 'absolute',
    margin: 20,
    color: colors.primaryText,
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
}));

type Props = {
  open: boolean;
  // onClick: () => any;
  // onClickCancel: () => any;
  onClose: () => any;

  accessToken: string;
  refreshToken: string;
};

function BugModal(props: Props) {
  const styles = useStyles();

  const BugCategories = [
    'Homepage',
    'Discover',
    'Communities',
    'Events',
    'Connections',
    'Profile',
    'Posts',
    'Messages',
    'Other',
  ];

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Bug #1');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const [transition, setTransition] = useState<any>();
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarMode, setSnackbarMode] = useState<
    'success' | 'error' | 'notify' | null
  >(null);

  function changeTitle(event: any) {
    setTitle(event.target.value);
  }

  function changeType(event: any) {
    setCategory(event.target.value);
  }

  function handleDescriptionChange(event: any) {
    setDescription(event.target.value);
  }

  function slideLeft(props: TransitionProps) {
    return <Slide {...props} direction="left" />;
  }

  async function handleSubmit() {
    //make API call
    //If request is successful show next state
    setLoading(true);
    const { data } = await makeRequest(
      'POST',
      '/api/feedback/bug',
      {
        title,
        category,
        message: description,
      },
      true,
      props.accessToken,
      props.refreshToken
    );
    setLoading(false);
    setTransition(() => slideLeft);
    setSnackbarMessage('Thank you for submitting a bug report!');
    setSnackbarMode('notify');
    handleClose();
  }

  function handleClose() {
    props.onClose();
  }

  function renderContent() {
    return (
      <>
        <DialogTitle>
          <RSText type="head" size={16} bold color={'black'}>
            Report A Bug
          </RSText>
        </DialogTitle>
        <DialogContent>
          <div>
            <BugTextField
              label="Title"
              value={title}
              onChange={changeTitle}
              width={450}
            />
          </div>
          <Select
            className={styles.select}
            variant="outlined"
            value={category}
            onChange={changeType}
            label={category}
          >
            {BugCategories.map((singleBug) => (
              <MenuItem value={singleBug}>{singleBug}</MenuItem>
            ))}
          </Select>
          <div>
            <BugTextField
              label="Description"
              value={description}
              onChange={handleDescriptionChange}
              width={450}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button className={styles.cancelButton} onClick={props.onClose}>
            CANCEL
          </Button>
          <Button className={styles.okButton} onClick={handleSubmit}>
            SUBMIT
          </Button>
        </DialogActions>
      </>
    );
  }

  return (
    <div>
      <ManageSpeakersSnackbar
        message={snackbarMessage}
        transition={transition}
        mode={snackbarMode}
        handleClose={() => setSnackbarMode(null)}
      />
      <Dialog open={props.open} PaperComponent={PaperComponent}>
        {renderContent()}
        <div className={styles.loading}>{loading && <CircularProgress />}</div>
      </Dialog>
    </div>
  );
}

function PaperComponent(props: PaperProps) {
  const styles = useStyles();
  return (
    <Draggable cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} className={styles.paper} square={false} />
    </Draggable>
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

export default connect(mapStateToProps, mapDispatchToProps)(BugModal);
