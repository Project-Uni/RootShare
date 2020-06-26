import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Drawer } from "@material-ui/core";

import MyConnections from "../images/MyConnections.png";



const useStyles = makeStyles((_: any) => ({
  drawerPaper: {
    background: "#242d56",
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
          <img
            src={MyConnections}
            alt="MyConnections"
            className={styles.logo}
          />
        </div>
        {props.children}
      </div>
    </Drawer>
  );
}

export default EventDrawer;
