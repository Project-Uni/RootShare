import React from "react";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
}));

type Props = {};

function ProfileDrawer(props: Props) {
  const styles = useStyles();
  return (
    <div className={styles.wrapper}>
      <p>I am the Profile Drawer</p>
    </div>
  );
}

export default ProfileDrawer;
