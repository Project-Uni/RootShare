import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Slide,
  Select,
  MenuItem,
  CircularProgress,
} from '@material-ui/core';
import { TransitionProps } from '@material-ui/core/transitions';
import Paper, { PaperProps } from '@material-ui/core/Paper';
import Draggable from 'react-draggable';
import { connect } from 'react-redux';
import { AiFillBug } from 'react-icons/ai';

import RSText from '../../../base-components/RSText';
import { colors } from '../../../theme/Colors';
import BugTextField from './BugTextField';

import ManageSpeakersSnackbar from '../../event-video/event-host/ManageSpeakersSnackbar';

import { makeRequest } from '../../../helpers/functions';

const useStyles = makeStyles((_: any) => ({
  paper: {
    background: colors.primaryText,
    width: 500,
  },
  okButton: {
    background: colors.bright,
    color: colors.primaryText,
    '&:hover': {
      background: 'lightgray',
    },
  },
  cancelButton: {},
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
  textField: {
    marginTop: 20,
  },
  serverErr: {
    marginBottom: 10,
  },
}));

type Props = {
  open: boolean;
  onClose: () => any;

  accessToken: string;
  refreshToken: string;
};

const BugCategories = [
  'User Interface',
  'Functionality',
  'Unable to Perform Action',
  'Request Feature',
  'Unexpected Behavior',
  'Other',
];

function BugModal(props: Props) {
  const styles = useStyles();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(BugCategories[0]);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const [transition, setTransition] = useState<any>();
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarMode, setSnackbarMode] = useState<
    'success' | 'error' | 'notify' | null
  >(null);

  //errors
  const [titleErr, setTitleErr] = useState(false);
  const [categoryErr, setCategoryErr] = useState(false);
  const [descriptionErr, setDescriptionErr] = useState(false);
  const [serverErr, setServerErr] = useState(false);

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

  function validateInputs() {
    let hasErr = false;
    if (title === '') {
      setTitleErr(true);
      hasErr = true;
    } else {
      setTitleErr(false);
    }
    if (category === '') {
      setCategoryErr(true);
      hasErr = true;
    } else {
      setCategoryErr(false);
    }
    if (description === '') {
      setDescriptionErr(true);
      hasErr = true;
    } else {
      setDescriptionErr(false);
    }
    return hasErr;
  }

  async function handleSubmit() {
    setServerErr(false);
    if (!validateInputs()) {
      setLoading(true);
      const { data } = await makeRequest('POST', '/api/feedback/bug', {
        title,
        category,
        message: description,
      });
      setLoading(false);
      if (data.success === 1) {
        setTransition(() => slideLeft);
        setSnackbarMessage('Thank you for submitting a bug report!');
        setSnackbarMode('notify');
        handleClose();
      } else {
        setServerErr(true);
      }
    }
  }

  function handleClose() {
    props.onClose();
  }

  function renderContent() {
    return (
      <>
        <DialogTitle>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <AiFillBug color="black" size={28} style={{ marginRight: 15 }} />
            <RSText type="head" size={16} bold color={'black'}>
              Report A Bug
            </RSText>
          </div>
        </DialogTitle>
        <DialogContent>
          {serverErr && (
            <RSText
              type="body"
              color={colors.brightError}
              size={12}
              italic
              className={styles.serverErr}
            >
              There was an error reporting this bug.
            </RSText>
          )}
          <BugTextField
            label="Title"
            value={title}
            onChange={changeTitle}
            width={450}
            error={titleErr}
            helperText={titleErr ? 'Title is required.' : ''}
          />
          <Select
            className={styles.select}
            variant="outlined"
            value={category}
            onChange={changeType}
            label={'Category'}
            error={categoryErr}
          >
            {BugCategories.map((singleBug) => (
              <MenuItem value={singleBug}>{singleBug}</MenuItem>
            ))}
          </Select>
          <BugTextField
            label="Description"
            value={description}
            onChange={handleDescriptionChange}
            width={450}
            className={styles.textField}
            multiline
            error={descriptionErr}
            helperText={descriptionErr ? 'Description is required.' : ''}
          />
        </DialogContent>
        <DialogActions>
          {loading && <CircularProgress />}
          <Button
            className={styles.cancelButton}
            onClick={props.onClose}
            disabled={loading}
          >
            CANCEL
          </Button>
          <Button
            className={styles.okButton}
            onClick={handleSubmit}
            disabled={loading}
          >
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
