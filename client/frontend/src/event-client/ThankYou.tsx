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
import RSText from '../base-components/RSText';
import { colors } from '../theme/Colors';

const useStyles = makeStyles((_: any) => ({
  paper: {
    background: 'white',
    width: 200,
    height: 150,
  },
  mobileText: {
    marginTop: 20,
  },
  thankYou: {
    flex: 1,
    top: 0,
    position: 'absolute',
    margin: 20,
    color: colors.primaryText,
  },
  okButton: {
    flex: 1,
    bottom: 0,
    position: 'absolute',
    margin: 20,
    color: 'black',
  },
}));

type Props = {
  open: boolean;
  onClick: () => any;
};

function ThankYou(props: Props) {
  const styles = useStyles();

  return (
    <Dialog open={props.open} PaperComponent={PaperComponent}>
      <DialogTitle>
        <RSText
          type="head"
          size={16}
          bold
          color={'black'}
          className={styles.thankYou}
        >
          Thank you!
        </RSText>
      </DialogTitle>
      <DialogActions>
        <Button className={styles.okButton} onClick={props.onClick}>
          You're welcome!
        </Button>
      </DialogActions>
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

export default ThankYou;
