import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";

import EventClientHeader from "./EventClientHeader";
import EventClientEmptyVideoPlayer from "./event-video/EventClientEmptyVideoPlayer";
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

  const [advertisements, setAdvertisements] = useState(["black"]);
  const [adLoaded, setAdLoaded] = useState(false);

  useEffect(() => {
    fetchAds();
  }, []);

  function fetchAds() {
    const ads = ["lightpink", "lightgreen", "lightblue"];
    setAdvertisements(ads);
    setAdLoaded(true);
  }

  return (
    <div className={styles.wrapper}>
      <EventClientHeader />
      <div className={styles.body}>
        <div className={styles.left}>
          <EventClientEmptyVideoPlayer height={505} width={720} />
          {adLoaded && (
            <EventClientAdvertisement
              height={100}
              width={720}
              advertisements={advertisements}
            />
          )}
        </div>
        <div className={styles.right}>
          <EventClientMessageContainer />
        </div>
      </div>
    </div>
  );
}

export default EventClientBase;
