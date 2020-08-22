import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { Modal, IconButton } from '@material-ui/core';

import RSText from '../../../base-components/RSText';
import { colors } from '../../../theme/Colors';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    width: 500,
    background: colors.primaryText,
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
  handleClose: () => any;
};

function PendingMembersModal(props: Props) {
  const styles = useStyles();
  return (
    <Modal open={props.open}>
      <div
        className={styles.wrapper}
        style={{
          position: 'absolute',
          bottom: `${50}%`,
          left: `${50}%`,
          transform: `translate(-${50}%, -${50}%)`,
        }}
      >
        <div className={styles.top}>
          <RSText type="head" size={15} bold>
            Pending Members
          </RSText>
          <IconButton onClick={props.handleClose} size="medium">
            X
          </IconButton>
        </div>
      </div>
    </Modal>
  );
}

export default PendingMembersModal;
