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
import { colors } from '../../theme/Colors';

const useStyles = makeStyles((_: any) => ({
  paper: {
    background: colors.second,
    width: 280,
    height: 150,
  },
  mobileText: {
    marginTop: 20,
  },
  thankYou: {
    flex: 1,
    top: 0,
    marginTop: 10,
    marginLeft: 20,
    justifyContent: 'center',
    alignItems: 'center',
    color: colors.primaryText,
  },
  okButton: {
    flex: 1,
    bottom: 0,
    marginBottom: 30,
    marginLeft: 45,
    justifyContent: 'center',
    alignItems: 'center',
    color: colors.primaryText,
  },
}));

type Props = {
  open: boolean;
  onClick: () => any;
};

function ContactModal(props: Props) {
  const styles = useStyles();

  return (
    <Dialog open={props.open} PaperComponent={PaperComponent}>
      <DialogTitle>
        <RSText
          type="head"
          size={16}
          bold
          color={colors.primaryText}
          className={styles.thankYou}
        >
          dev@rootshare.io
        </RSText>
      </DialogTitle>
      <Button className={styles.okButton} onClick={props.onClick}>
        <a href="mailto:dev@rootshare.io" style={{ textDecoration: 'none' }}>
          <RSText
            type="body"
            size={12}
            color={colors.primaryText}
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
