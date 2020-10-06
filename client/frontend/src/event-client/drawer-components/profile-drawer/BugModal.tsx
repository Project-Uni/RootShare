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
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textField: {
    marginTop: 20,
  },
}));

type Props = {
  open: boolean;
  onClose: () => any;

  accessToken: string;
  refreshToken: string;
};

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
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <AiFillBug color="black" size={28} style={{ marginRight: 15 }} />
            <RSText type="head" size={16} bold color={'black'}>
              Report A Bug
            </RSText>
          </div>
        </DialogTitle>
        <DialogContent>
          <BugTextField
            label="Title"
            value={title}
            onChange={changeTitle}
            width={450}
          />
          <Select
            className={styles.select}
            variant="outlined"
            value={category}
            onChange={changeType}
            label={'Category'}
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
          />
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
