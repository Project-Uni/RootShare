import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { IconButton, Snackbar } from '@material-ui/core';
import { FaRegCheckCircle } from 'react-icons/fa';
import { MdErrorOutline, MdInfoOutline } from 'react-icons/md';
import CloseIcon from '@material-ui/icons/Close';

import { useSelector, useDispatch } from 'react-redux';

import RSText from '../../../base-components/RSText';
import { slideLeft } from '../../../helpers/functions';
import { RootshareReduxState } from '../../../redux/store/stateManagement';
import Theme from '../../../theme/Theme';
import { clearSnackbar } from '../../../redux/actions/interactions';

const useStyles = makeStyles((_) => ({
  successSnackBar: {
    background: Theme.bright,
  },
  errorSnackbar: {
    background: Theme.error,
  },
  notifySnackbar: {
    background: Theme.bright,
  },
  closeButton: {
    color: Theme.altText,
  },
  snackbarText: {
    marginLeft: '15px',
  },
  snackBarMessageDiv: {
    display: 'flex',
    alignItems: 'center',
  },
}));

export type SnackbarProps = {
  mode: 'success' | 'error' | 'notify' | null;
  message: string;
};

export default function SnackbarNotification() {
  const { mode, message } = useSelector(
    (state: RootshareReduxState) => state.snackbarNotification
  );

  const dispatch = useDispatch();

  const [transition, setTransition] = useState(() => slideLeft);
  const styles = useStyles();

  const rootStyle = () => {
    switch (mode) {
      case 'success':
        return styles.successSnackBar;
      case 'error':
        return styles.errorSnackbar;
      case 'notify':
        return styles.notifySnackbar;
    }
  };

  useEffect(() => {
    if (mode) setTransition(() => slideLeft);
  }, [mode]);

  const handleClose = () => {
    dispatch(clearSnackbar());
  };

  return (
    <Snackbar
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      ContentProps={{
        classes: {
          root: rootStyle(),
        },
      }}
      open={Boolean(mode)}
      autoHideDuration={6000}
      TransitionComponent={transition}
      onClose={handleClose}
      message={
        <div className={styles.snackBarMessageDiv}>
          {mode === 'success' && (
            <FaRegCheckCircle size={24} color={Theme.altText} />
          )}
          {mode === 'error' && <MdErrorOutline size={24} color={Theme.altText} />}
          {mode === 'notify' && <MdInfoOutline size={24} color={Theme.altText} />}
          <RSText
            type="body"
            className={styles.snackbarText}
            size={12}
            color={Theme.altText}
          >
            {message}
          </RSText>
        </div>
      }
      action={
        <IconButton onClick={handleClose} className={styles.closeButton}>
          <CloseIcon />
        </IconButton>
      }
    />
  );
}
