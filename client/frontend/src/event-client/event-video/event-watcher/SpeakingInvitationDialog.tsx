import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@material-ui/core';
import Paper, { PaperProps } from '@material-ui/core/Paper';
import Draggable from 'react-draggable';

import { colors } from '../../../theme/Colors';

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
  acceptButton: {
    background: colors.bright,
  },
}));

type Props = {
  open: boolean;
  onReject: () => any;
  onAccept: () => any;
};

function SpeakingInviteDialog(props: Props) {
  const styles = useStyles();

  return (
    <Dialog open={props.open} PaperComponent={PaperComponent}>
      <DialogTitle
        style={{ cursor: 'move' }}
        id="draggable-title"
        className={styles.text}
      >
        Guest Speaking Invite
      </DialogTitle>
      <DialogContent>
        <DialogContentText className={styles.text}>
          You have been invited to enter the event as a guest speaker.
        </DialogContentText>
        <DialogContentText className={styles.text}>
          Please be mindful of what you say!
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onReject} className={styles.secondaryText}>
          Reject
        </Button>
        <Button
          onClick={props.onAccept}
          className={[styles.text, styles.acceptButton].join(' ')}
        >
          Accept
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default SpeakingInviteDialog;

function PaperComponent(props: PaperProps) {
  const styles = useStyles();
  return (
    <Draggable handle="#draggable-title" cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} className={styles.paper} square={false} />
    </Draggable>
  );
}
