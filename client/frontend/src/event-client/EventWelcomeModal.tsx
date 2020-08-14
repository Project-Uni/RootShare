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
    background: colors.second,
  },
  mobileText: {
    marginTop: 20,
  },
  okButton: {
    color: colors.primaryText,
  },
}));

type Props = {
  open: boolean;
  isMobile?: boolean;
  onAck: () => any;
  maxWidth?: number;
  maxHeight?: number;
};

function EventWelcomeModal(props: Props) {
  const styles = useStyles();

  return (
    <Dialog open={props.open} PaperComponent={PaperComponent}>
      <DialogTitle>
        <RSText type="head" size={16} bold color={colors.primaryText}>
          Welcome to RootShare!
        </RSText>
      </DialogTitle>
      <DialogContent>
        <div
          style={{
            maxHeight: props.maxHeight || 500,
            maxWidth: props.maxWidth || 500,
          }}
        >
          <RSText color={colors.primaryText}>
            Nicotine... I'm a fiend... Hittin' it... Since 17... Without it... I'm so
            mean... Don't do drugs... You'll get addicted... But I didn't listen...
            Now I need... NICOTINE YA YA YA... YA YA YA... NICOTINE... YA YA YA...
            YA... YA... YA... GO OUT AND BUY A MOTHAFUCKIN LYCHEE PUFF PLUS
            YAYAYAYAYA
          </RSText>
        </div>
      </DialogContent>
      <DialogActions>
        <Button className={styles.okButton} onClick={props.onAck}>
          OK
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

export default EventWelcomeModal;
