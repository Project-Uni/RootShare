import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import EventClientHeader from "./EventClientHeader";
import EventClientVideoPlayer from "./EventClientVideoPlayer";
import EventClientAdvertisement from "./EventClientAdvertisement";

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
  left: {},
}));

type Props = {};

function EventClientBase(props: Props) {
  const styles = useStyles();
  return (
    <div className={styles.wrapper}>
      <EventClientHeader />
      <div className={styles.left}>
        <EventClientVideoPlayer />
        <EventClientAdvertisement />
      </div>
    </div>
  );
}

export default EventClientBase;
