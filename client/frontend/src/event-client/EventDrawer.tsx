import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Drawer } from "@material-ui/core";

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
  drawerPaper: {
    background: "#3D66DE",
  },
}));

type Props = {
  open: boolean;
  children: React.ReactNode;
  handleClose: () => void;
};

function EventDrawer(props: Props) {
  const styles = useStyles();
  const anchor = "right";

  return (
    <Drawer
      anchor={anchor}
      open={props.open}
      onClose={props.handleClose}
      classes={{ paper: styles.drawerPaper }}
    >
      {props.children}
    </Drawer>
  );
}

export default EventDrawer;
