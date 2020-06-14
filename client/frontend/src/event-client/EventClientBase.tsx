import React from "react";
import { makeStyles } from "@material-ui/core/styles";

import EventClientHeader from "./EventClientHeader";
import EventClientVideoPlayer from "./EventClientVideoPlayer";
import EventClientAdvertisement from "./EventClientAdvertisement";
import EventClientMessageContainer from "./EventMessageContainer";

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
  body: {
    display: "flex",
    justifyContent: "space-between",
  },
  left: {},
  right: {},
}));

type Props = {};

function EventClientBase(props: Props) {
  const styles = useStyles();
  return (
    <div className={styles.wrapper}>
      <EventClientHeader />
      <div className={styles.body}>
        <div className={styles.left}>
          <EventClientVideoPlayer />
          <EventClientAdvertisement />
        </div>
        <div className={styles.right}>
          <EventClientMessageContainer />
        </div>
      </div>
    </div>
  );
}

export default EventClientBase;
