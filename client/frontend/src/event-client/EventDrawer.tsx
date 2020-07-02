import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Drawer } from "@material-ui/core";

import { colors } from "../theme/Colors"


const useStyles = makeStyles((_: any) => ({
  drawerPaper: {
    background: colors.secondary,
  },
  logoDiv: {
    marginTop: 20,
    textAlign: "center",
  },
  logo: {
    height: "75px",
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
      <div className={styles.drawerWrapper}>
        <div className={styles.logoDiv}>
        </div>
        {props.children}
      </div>
    </Drawer>
  );
}

export default EventDrawer;
