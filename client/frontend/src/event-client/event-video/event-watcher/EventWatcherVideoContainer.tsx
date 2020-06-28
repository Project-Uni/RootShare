import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import axios from 'axios';

import EventClientEmptyVideoPlayer from '../EventClientEmptyVideoPlayer';
import VideoPlayer from '../VideoPlayer';

import log from '../../../helpers/logger';

const EVENT_MESSAGES_CONTAINER_WIDTH = 300;
const AD_CONTAINER_HEIGHT = 125;
const HEADER_HEIGHT = 60;

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    minWidth: 1100 - EVENT_MESSAGES_CONTAINER_WIDTH
  },
  videoPlayer: {
    width: window.innerWidth - EVENT_MESSAGES_CONTAINER_WIDTH,
    height: window.innerHeight - AD_CONTAINER_HEIGHT - HEADER_HEIGHT
  }
}));

type Props = {};

function EventWatcherVideoContainer(props: Props) {
  const styles = useStyles();
  const [videoData, setVideoData] = useState('');
  const [playerWidth, setPlayerWidth] = useState(
    window.innerWidth > 1100
      ? window.innerWidth - EVENT_MESSAGES_CONTAINER_WIDTH
      : 1100 - EVENT_MESSAGES_CONTAINER_WIDTH
  );
  const [playerHeight, setPlayerHeight] = useState(window.innerHeight - AD_CONTAINER_HEIGHT - HEADER_HEIGHT);

  useEffect(() => {
    setSourceToLatestWebinarID();
    window.addEventListener("resize", handleResize);
  }, []);

  function handleResize() {
    if (window.innerWidth >= 1100) {
      setPlayerWidth(window.innerWidth - EVENT_MESSAGES_CONTAINER_WIDTH);
    }
    setPlayerHeight(window.innerHeight - AD_CONTAINER_HEIGHT - HEADER_HEIGHT);
  }

  async function setSourceToLatestWebinarID() {
    const { data } = await axios.get('/webinar/latestWebinarID');
    if (data['success'] === 1) getVideoData(data.content['webinarID']);
    else log('error', data['message']);
  }

  async function getVideoData(webinarID: string) {
    const { data } = await axios.post('/webinar/getMuxPlaybackID', { webinarID });
    if (data['success'] === 1) {
      const { muxPlaybackID } = data.content;
      const source = `https://stream.mux.com/${muxPlaybackID}.m3u8`;
      const streamExists = await checkStreamExists(source);

      if (streamExists) setVideoData(source);
      else log('error', data['message']);
    }
    else {
      log('error', data['message']);
    }
  }

  async function checkStreamExists(source: string) {
    return await axios.get(source)
      .then((_) => {
        return true;
      }).catch((_) => {
        return false;
      });
  }


  return (
    <div className={styles.wrapper}>
      {videoData !== ''
        ? <VideoPlayer
          src={videoData}
          height={playerHeight}
          width={playerWidth}
        />
        : <EventClientEmptyVideoPlayer
          height={playerHeight}
          width={playerWidth}
        />
      }
    </div>
  );
}

export default EventWatcherVideoContainer;
