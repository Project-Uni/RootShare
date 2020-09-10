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
import RSText from '../../../base-components/RSText';
import { colors } from '../../../theme/Colors';

import { eventsMenu, eventsSidebar } from '../../../images/demo';

const useStyles = makeStyles((_: any) => ({
  paper: {
    background: colors.second,
  },
  mobileText: {
    marginTop: 20,
  },
  okButton: {
    color: colors.primaryText,
    background: colors.bright,
  },
  sidebarImage: {
    height: 200,
    border: `1px solid ${colors.primaryText}`,
  },
  imageContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  menuImage: {
    width: 300,
    border: `1px solid ${colors.primaryText}`,
    marginLeft: 25,
  },
  textMargin: {
    marginTop: 15,
  },
}));

type Props = {
  open: boolean;
  onAck: () => any;
  maxWidth?: number;
  maxHeight?: number;
};

function BetaModal(props: Props) {
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
            overflow: 'scroll',
          }}
        >
          <RSText color={colors.primaryText} size={13}>
            We're excited to have you on our platform! The platform is still under
            development, so please be patient with us.
          </RSText>
          <RSText color={colors.primaryText} className={styles.textMargin} size={13}>
            In order to navigate to the event, click on the Events tab in the left
            sidebar
          </RSText>
          <div className={styles.imageContainer}>
            <img src={eventsSidebar} alt="Sidebar" className={styles.sidebarImage} />
          </div>

          <RSText color={colors.primaryText} size={13}>
            Or by clicking on the menu icon at the top left corner of your screen.
          </RSText>
          <div className={styles.imageContainer}>
            <img src={eventsMenu} alt="Menu" className={styles.menuImage} />
          </div>

          <RSText color={colors.primaryText} size={13}>
            then click on the event that you are here to watch.
          </RSText>
          <RSText
            color={colors.primaryText}
            className={styles.textMargin}
            size={13}
            bold
          >
            We hope you enjoy!
          </RSText>
        </div>
      </DialogContent>
      <DialogActions>
        <Button className={styles.okButton} onClick={props.onAck} size="large">
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

export default BetaModal;
