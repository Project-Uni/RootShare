import React from "react";
import { makeStyles } from "@material-ui/core/styles";

import EventClientHeader from "./EventClientHeader";
import EventClientVideoPlayer from "./event-video/EventClientVideoPlayer";
import EventClientAdvertisement from "./EventClientAdvertisement";
import EventClientMessageContainer from "./event-messages/EventMessageContainer";

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
  body: {
    display: "flex",
    justifyContent: "space-between",
  },
  left: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
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
          <EventClientVideoPlayer height={505} width={720} />
          <EventClientAdvertisement height={100} width={720} />
        </div>
        <div className={styles.right}>
          <EventClientMessageContainer />
        </div>
      </div>
    </div>
  );
}

export default EventClientBase;
