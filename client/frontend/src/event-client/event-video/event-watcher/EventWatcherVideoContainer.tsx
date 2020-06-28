import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import axios from 'axios';

import EventClientEmptyVideoPlayer from '../EventClientEmptyVideoPlayer';
import VideoPlayer from '../VideoPlayer';

import log from '../../../helpers/logger';

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
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
      .then((response) => {
        return true;
      }).catch((err) => {
        return false;
      });
  }


  return (
    <div className={styles.wrapper}>
      {videoData !== '' ? <VideoPlayer src={videoData} /> : <EventClientEmptyVideoPlayer height={505} width={720} />}
    </div>
  );
}

export default EventWatcherVideoContainer;
