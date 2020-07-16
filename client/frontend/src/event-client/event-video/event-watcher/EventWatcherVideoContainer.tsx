import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import axios from 'axios';

import EventClientEmptyVideoPlayer from '../video/EventClientEmptyVideoPlayer';
import VideoPlayer from '../video/VideoPlayer';

import log from '../../../helpers/logger';
import { makeRequest } from '../../../helpers/makeRequest';
import { connect } from 'react-redux';
import { updateAccessToken, updateRefreshToken } from '../../../redux/actions/token';

const MIN_WINDOW_WIDTH = 1100;
const EVENT_MESSAGES_CONTAINER_WIDTH = 350;
const AD_CONTAINER_HEIGHT = 125;
const HEADER_HEIGHT = 60;

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    minWidth: MIN_WINDOW_WIDTH - EVENT_MESSAGES_CONTAINER_WIDTH,
  },
}));

type Props = {
  accessToken: string;
  refreshToken: string;
  updateAccessToken: (accessToken: string) => void;
  updateRefreshToken: (refreshToken: string) => void;
};

function EventWatcherVideoContainer(props: Props) {
  const styles = useStyles();
  const [videoData, setVideoData] = useState('');
  const [playerWidth, setPlayerWidth] = useState(
    window.innerWidth > MIN_WINDOW_WIDTH
      ? window.innerWidth - EVENT_MESSAGES_CONTAINER_WIDTH
      : MIN_WINDOW_WIDTH - EVENT_MESSAGES_CONTAINER_WIDTH
  );
  const [playerHeight, setPlayerHeight] = useState(
    window.innerHeight - AD_CONTAINER_HEIGHT - HEADER_HEIGHT
  );

  useEffect(() => {
    setSourceToLatestWebinarID();
    window.addEventListener('resize', handleResize);
  }, []);

  function handleResize() {
    if (window.innerWidth >= MIN_WINDOW_WIDTH) {
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
    const { data } = await makeRequest(
      'POST',
      '/webinar/getMuxPlaybackID',
      { webinarID },
      true,
      props.accessToken,
      props.refreshToken
    );
    if (data['success'] === 1) {
      const { muxPlaybackID } = data.content;
      const source = `https://stream.mux.com/${muxPlaybackID}.m3u8`;
      const streamExists = await checkStreamExists(source);

      if (streamExists) setVideoData(source);
      else log('error', data['message']);
    } else {
      log('error', data['message']);
    }
  }

  async function checkStreamExists(source: string) {
    return await axios
      .get(source)
      .then((_) => {
        return true;
      })
      .catch((_) => {
        return false;
      });
  }

  return (
    <div className={styles.wrapper}>
      {videoData !== '' ? (
        <VideoPlayer src={videoData} height={playerHeight} width={playerWidth} />
      ) : (
        <EventClientEmptyVideoPlayer height={playerHeight} width={playerWidth} />
      )}
    </div>
  );
}

const mapStateToProps = (state: { [key: string]: any }) => {
  return {
    accessToken: state.accessToken,
    refreshToken: state.refreshToken,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    updateAccessToken: (accessToken: string) => {
      dispatch(updateAccessToken(accessToken));
    },
    updateRefreshToken: (refreshToken: string) => {
      dispatch(updateRefreshToken(refreshToken));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EventWatcherVideoContainer);
