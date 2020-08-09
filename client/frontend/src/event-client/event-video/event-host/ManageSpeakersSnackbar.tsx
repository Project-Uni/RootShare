import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { IconButton, Snackbar } from '@material-ui/core';
import { FaRegCheckCircle } from 'react-icons/fa';
import { MdErrorOutline, MdInfoOutline } from 'react-icons/md';
import CloseIcon from '@material-ui/icons/Close';

import { colors } from '../../../theme/Colors';
import RSText from '../../../base-components/RSText';

const useStyles = makeStyles((_) => ({
  successSnackBar: {
    background: 'green',
  },
  errorSnackbar: {
    background: colors.error,
  },
  notifySnackbar: {
    background: colors.bright,
  },
  closeButton: {
    color: colors.primaryText,
  },
  snackbarText: {
    marginLeft: '15px',
  },
  snackBarMessageDiv: {
    display: 'flex',
    alignItems: 'center',
  },
}));

type Props = {
  mode: 'success' | 'error' | 'notify' | null;
  message: string;
  handleClose: () => void;
  transition: () => JSX.Element;
};

export default function ManageSpeakersSnackbar(props: Props) {
  const snackbarMode = props.mode;
  const styles = useStyles();
  const rootStyle = () => {
    switch (snackbarMode) {
      case 'success':
        return styles.successSnackBar;
      case 'error':
        return styles.errorSnackbar;
      case 'notify':
        return styles.notifySnackbar;
    }
  };

  return (
    <Snackbar
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      ContentProps={{
        classes: {
          root: rootStyle(),
        },
      }}
      open={Boolean(snackbarMode)}
      autoHideDuration={6000}
      TransitionComponent={props.transition}
      onClose={props.handleClose}
      message={
        <div className={styles.snackBarMessageDiv}>
          {snackbarMode === 'success' && (
            <FaRegCheckCircle size={24} color={colors.primaryText} />
          )}
          {snackbarMode === 'error' && (
            <MdErrorOutline size={24} color={colors.primaryText} />
          )}
          {snackbarMode === 'notify' && (
            <MdInfoOutline size={24} color={colors.primaryText} />
          )}
          <RSText type="body" className={styles.snackbarText} size={12}>
            {props.message}
          </RSText>
        </div>
      }
      action={
        <IconButton onClick={props.handleClose} className={styles.closeButton}>
          <CloseIcon />
        </IconButton>
      }
    />
  );
}
