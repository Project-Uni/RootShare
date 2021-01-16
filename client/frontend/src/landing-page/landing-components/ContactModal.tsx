import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
} from '@material-ui/core';
import Draggable from 'react-draggable';
import Paper, { PaperProps } from '@material-ui/core/Paper';
import RSText from '../../base-components/RSText';
import { IoIosClose } from 'react-icons/io';

import Theme from '../../theme/Theme';

const useStyles = makeStyles((_: any) => ({
  paper: {
    background: Theme.primary,
    width: 280,
    height: 180,
  },
  mobileText: {
    marginTop: 20,
  },
  thankYou: {
    flex: 1,
    top: 0,
    marginLeft: 20,
    justifyContent: 'center',
    alignItems: 'center',
    color: Theme.white,
  },
  okButton: {
    flex: 1,
    bottom: 0,
    marginBottom: 30,
    marginLeft: 45,
    justifyContent: 'center',
    alignItems: 'center',
    color: Theme.white,
  },
  closeButton: {
    flex: 1,
    marginLeft: 180,
    justifyContent: 'center',
  },
}));

type Props = {
  open: boolean;
  onClose: () => any;
};

function ContactModal(props: Props) {
  const styles = useStyles();

  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
      PaperComponent={PaperComponent}
    >
      <DialogTitle>
        <Button className={styles.closeButton} onClick={props.onClose}>
          <IoIosClose color={Theme.white} size={25}></IoIosClose>
        </Button>
        <RSText
          type="head"
          size={16}
          bold
          color={Theme.white}
          className={styles.thankYou}
        >
          support@rootshare.io
        </RSText>
      </DialogTitle>
      <Button className={styles.okButton} onClick={props.onClose}>
        <a href="mailto:support@rootshare.io" style={{ textDecoration: 'none' }}>
          <RSText
            type="body"
            size={12}
            color={Theme.white}
            className={styles.thankYou}
          >
            SEND AN EMAIL
          </RSText>
        </a>
      </Button>
    </Dialog>
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

export default ContactModal;
