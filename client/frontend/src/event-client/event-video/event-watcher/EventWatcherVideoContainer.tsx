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
  wrapper: {},
  videoPlayer: {
    width: window.innerWidth - EVENT_MESSAGES_CONTAINER_WIDTH,
    height: window.innerHeight - AD_CONTAINER_HEIGHT - HEADER_HEIGHT
  }
}));

type Props = {};

function EventWatcherVideoContainer(props: Props) {
  const styles = useStyles();
  const [videoData, setVideoData] = useState('');

  useEffect(() => {
    setSourceToLatestWebinarID();
  }, []);

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
        ? <VideoPlayer src={videoData} className={styles.videoPlayer} />
        : <EventClientEmptyVideoPlayer
          height={window.innerHeight - AD_CONTAINER_HEIGHT - HEADER_HEIGHT}
          width={window.innerWidth - EVENT_MESSAGES_CONTAINER_WIDTH}
        />
      }
    </div>
  );
}

export default EventWatcherVideoContainer;
