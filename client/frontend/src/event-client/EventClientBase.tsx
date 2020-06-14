import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import EventClientHeader from "./EventClientHeader";

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
}));

type Props = {};

function EventClientBase(props: Props) {
  const styles = useStyles();
  return (
    <div className={styles.wrapper}>
      <EventClientHeader />
    </div>
  );
}

export default EventClientBase;
