import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import RSText from '../../../base-components/RSText';
import { IconButton, Modal } from '@material-ui/core';
import { colors } from '../../../theme/Colors';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    background: colors.primaryText,
    borderRadius: 5,
  },

  top: {
    textAlign: 'left',
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    display: 'flex',
    marginLeft: 15,
    marginRight: 15,
  },
}));

type Props = {
  open: boolean;
  className?: string;
  title: string;
  children?: React.ReactNode;
  onClose: () => any;
};

function RSModal(props: Props) {
  const styles = useStyles();
  return (
    <Modal
      open={props.open}
      disableEnforceFocus
      disableAutoFocus
      onClose={props.onClose}
    >
      <div
        className={[styles.wrapper, props.className].join(' ')}
        style={{
          position: 'absolute',
          top: `${50}%`,
          left: `${50}%`,
          transform: `translate(-${50}%, -${50}%)`,
        }}
      >
        <div className={styles.top}>
          <RSText type="head" size={15} bold>
            {props.title}
          </RSText>
          <IconButton onClick={props.onClose} size="medium">
            X
          </IconButton>
        </div>
        {props.children}
      </div>
    </Modal>
  );
}

export default RSModal;
