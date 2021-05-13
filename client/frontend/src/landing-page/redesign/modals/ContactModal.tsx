import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { Dialog, Button } from '@material-ui/core';
import Paper, { PaperProps } from '@material-ui/core/Paper';
import { IoIosClose } from 'react-icons/io';

import RSText from '../../../base-components/RSText';

import Theme from '../../../theme/Theme';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  paper: {
    background: Theme.primary,
    width: 280,
    height: 180,
  },
  mobileText: {
    marginTop: 20,
  },
  closeButton: {
    alignSelf: 'flex-end',
    margin: 5,
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
      <div className={styles.wrapper}>
        <Button className={styles.closeButton} onClick={props.onClose}>
          <IoIosClose color={Theme.white} size={25}></IoIosClose>
        </Button>
        <RSText type="head" size={16} bold color={Theme.white}>
          support@rootshare.io
        </RSText>
        <Button style={{ marginTop: 20 }} onClick={props.onClose}>
          <a href="mailto:support@rootshare.io" style={{ textDecoration: 'none' }}>
            <RSText type="body" size={12} color={Theme.white} style={{ flex: 1 }}>
              SEND AN EMAIL
            </RSText>
          </a>
        </Button>
      </div>
      {/* <DialogTitle>
        <Button className={styles.closeButton} onClick={props.onClose}>
          <IoIosClose color={Theme.white} size={25}></IoIosClose>
        </Button>
        <RSText type="head" size={16} bold color={Theme.white}>
          support@rootshare.io
        </RSText>
      </DialogTitle>
      <Button className={styles.okButton} onClick={props.onClose}>
        <a href="mailto:support@rootshare.io" style={{ textDecoration: 'none' }}>
          <RSText type="body" size={12} color={Theme.white} style={{ flex: 1 }}>
            SEND AN EMAIL
          </RSText>
        </a>
      </Button> */}
    </Dialog>
  );
}

function PaperComponent(props: PaperProps) {
  const styles = useStyles();
  return <Paper {...props} className={styles.paper} square={false} />;
}

export default ContactModal;
