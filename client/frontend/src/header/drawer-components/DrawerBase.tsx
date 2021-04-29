import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Drawer } from '@material-ui/core';

import { colors } from '../../theme/Colors';

const useStyles = (backgroundColor: string) =>
  makeStyles((_: any) => ({
    drawerPaper: {
      background: backgroundColor,
    },
    logoDiv: {
      marginTop: 20,
      textAlign: 'center',
    },
    logo: {
      height: '75px',
    },
    drawerWrapper: {
      marginLeft: 15,
      marginRight: 15,
    },
  }));

type Props = {
  open: boolean;
  children: React.ReactNode;
  handleClose: () => void;
  backgroundColor: string;
  anchor: 'left' | 'right';
};

function DrawerBase(props: Props) {
  const styles = useStyles(props.backgroundColor)();
  const anchor = props.anchor;

  return (
    <Drawer
      anchor={anchor}
      open={props.open}
      onClose={props.handleClose}
      classes={{ paper: styles.drawerPaper }}
    >
      <div className={styles.drawerWrapper}>{props.children}</div>
    </Drawer>
  );
}

export default DrawerBase;
