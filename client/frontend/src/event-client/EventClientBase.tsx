import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { isMobile } from 'react-device-detect';

import EventClientHeader from "./EventClientHeader";
import EventWatcherVideoContainer from './event-video/event-watcher/EventWatcherVideoContainer';
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
  adContainer: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center'
  }
}));

type Props = {
  match: {
    params: { [key: string]: any; };
    [key: string]: any;
  };
};

type EVENT_MODE = 'viewer' | 'speaker' | 'admin';

function EventClientBase(props: Props) {
  const styles = useStyles();

  const eventID = props.match.params['eventid'];
  const [advertisements, setAdvertisements] = useState(["black"]);
  const [adLoaded, setAdLoaded] = useState(false);
  const [eventMode, setEventMode] = useState('viewer');


  useEffect(() => {
    fetchAds();
    setDevPageMode();
  }, []);

  function fetchAds() {
    const ads = ["lightpink", "lightgreen", "lightblue"];
    setAdvertisements(ads);
    setAdLoaded(true);
  }

  function setDevPageMode() {
    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
      switch (eventID.charAt(eventID.length - 1)) {
        case '0':
          return setEventMode('viewer');
        case '1':
          return setEventMode('speaker');
        case '2':
          return setEventMode('admin');
        default:
          return setEventMode('viewer');
      }
    }
  }

  function renderVideoArea() {
    if (eventMode === 'viewer') return <EventWatcherVideoContainer />;
    else if (eventMode === 'speaker') return <p>Speaker video area</p>;
    else if (eventMode === 'admin') return <p>Admin video area</p>;
  }

  if (isMobile) {
    return <p>This feature is currently not available on mobile. Please switch to a desktop.</p>;
  }
  return (
    <div className={styles.wrapper}>
      <EventClientHeader />
      <div className={styles.body}>
        <div className={styles.left}>
          {renderVideoArea()}
          <div className={styles.adContainer}>
            {adLoaded && (
              <EventClientAdvertisement
                height={125}
                width={800}
                advertisements={advertisements}
              />
            )}
          </div>

        </div>
        <div className={styles.right}>
          <EventClientMessageContainer />
        </div>
      </div>
    </div>
  );
}

export default EventClientBase;
