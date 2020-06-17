import React from "react";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
}));

type Props = {};

function ConnectionsDrawer(props: Props) {
  const styles = useStyles();
  return (
    <div className={styles.wrapper}>
      <p>I am the ConnectionsDrawer</p>
    </div>
  );
}

export default ConnectionsDrawer;
