import React from 'react';
import { makeStyles, Theme as MuiTheme } from '@material-ui/core/styles';
import { Popper } from '@material-ui/core';
import { RSCard } from '../../main-platform/reusable-components';

const useStyles = makeStyles((muiTheme: MuiTheme) => ({ wrapper: {} }));

type Props = {
  open: boolean;
  anchorEl: null | HTMLElement;
  onClose: () => void;
};

export const Notifications = (props: Props) => {
  const { open, anchorEl, onClose } = props;
  const styles = useStyles();

  return (
    <Popper open={open} anchorEl={anchorEl} placement="bottom-end">
      <RSCard style={{ width: 300 }}>Popper</RSCard>
    </Popper>
  );
};
