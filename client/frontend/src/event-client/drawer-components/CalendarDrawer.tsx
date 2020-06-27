import React from "react";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
}));

type Props = {};

function CalendarDrawer(props: Props) {
  const styles = useStyles();
  return (
    <div className={styles.wrapper}>
      <p>I am the CalendarDrawer</p>
    </div>
  );
}

export default CalendarDrawer;
