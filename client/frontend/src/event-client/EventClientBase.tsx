import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { isMobile } from 'react-device-detect';

import RSText from '../base-components/RSText';

import EventClientHeader from "./EventClientHeader";
import HypeHeader from '../hype-page/headerFooter/HypeHeader';
import HypeFooter from '../hype-page/headerFooter/HypeFooter';

import EventWatcherVideoContainer from './event-video/event-watcher/EventWatcherVideoContainer';
import EventSpeakerContainer from './event-video/event-speaker/EventSpeakerContainer';
import EventAdminContainer from './event-video/event-admin/EventAdminContainer';

import EventClientAdvertisement from "./EventClientAdvertisement";
import EventClientMessageContainer from "./event-messages/EventMessageContainer";


import SampleEventAd from '../images/sample_event_ad.png';
import SampleAd2 from '../images/sampleAd2.png';

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

  const [advertisements, setAdvertisements] = useState(["black"]);
  const [adLoaded, setAdLoaded] = useState(false);
  const [eventMode, setEventMode] = useState('viewer');

  const eventID = props.match.params['eventid'];
  const minHeaderWidth = getHeaderMinWidth();


  useEffect(() => {
    fetchAds();
    setDevPageMode();
  }, []);

  function fetchAds() {
    const ads = [SampleEventAd, SampleAd2];
    // const ads = ["lightpink", "lightgreen", "lightblue"];
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
    else if (eventMode === 'speaker') return <EventSpeakerContainer />;
    else if (eventMode === 'admin') return <EventAdminContainer />;
  }

  function getHeaderMinWidth() {
    if (eventMode === 'viewer') return 1102;
    else return 1102;
  }

  // if (isMobile) {
  //   return (
  //     <div className={styles.wrapper}>
  //       <HypeHeader />
  //       <RSText type='subhead' size={16}>The live event feature is currently not available on mobile. Please switch to a desktop.</RSText>
  //     </div>);
  // }
  return (
    <div className={styles.wrapper}>
      <EventClientHeader minWidth={minHeaderWidth} />
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
      <HypeFooter minWidth={minHeaderWidth} />
    </div>
  );
}

export default EventClientBase;
