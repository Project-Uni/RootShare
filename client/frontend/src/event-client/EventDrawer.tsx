import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Drawer } from "@material-ui/core";

import RootShareLogoFullWhite from "../images/RootShareLogoFullWhite.png";

const useStyles = makeStyles((_: any) => ({
  drawerPaper: {
    background: "#3D66DE",
  },
  logoDiv: {
    marginTop: 20,
    textAlign: "center",
  },
  logo: {
    height: "75px",
  },
  drawerWrapper: {
    marginLeft: 20,
    marginRight: 20,
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
          <img
            src={RootShareLogoFullWhite}
            alt="RootShare"
            className={styles.logo}
          />
        </div>

        {props.children}
      </div>
    </Drawer>
  );
}

export default EventDrawer;
