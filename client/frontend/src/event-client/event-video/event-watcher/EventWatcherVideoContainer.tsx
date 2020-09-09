import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import axios from 'axios';

import EventClientEmptyVideoPlayer from '../video/EventClientEmptyVideoPlayer';
import VideoPlayer from '../video/VideoPlayer';

import { log } from '../../../helpers/functions';
import { connect } from 'react-redux';
import { updateAccessToken, updateRefreshToken } from '../../../redux/actions/token';
import { MuxMetaDataType } from '../../../helpers/types';

const MIN_WINDOW_WIDTH = 1150;
const EVENT_MESSAGES_CONTAINER_WIDTH = 350;
const AD_CONTAINER_HEIGHT = 125;
const HEADER_HEIGHT = 64;

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    minWidth: MIN_WINDOW_WIDTH - EVENT_MESSAGES_CONTAINER_WIDTH,
    height: '100%',
  },
}));

type Props = {
  accessToken: string;
  refreshToken: string;
  updateAccessToken: (accessToken: string) => void;
  updateRefreshToken: (refreshToken: string) => void;
  muxPlaybackID: string;
  muxMetaData: MuxMetaDataType;
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
    updateVideoData(props.muxPlaybackID);
    window.addEventListener('resize', handleResize);
  }, [props.muxPlaybackID]);

  function handleResize() {
    if (window.innerWidth >= MIN_WINDOW_WIDTH) {
      setPlayerWidth(window.innerWidth - EVENT_MESSAGES_CONTAINER_WIDTH);
    }
    setPlayerHeight(window.innerHeight - AD_CONTAINER_HEIGHT - HEADER_HEIGHT);
  }

  async function updateVideoData(muxPlaybackID: string) {
    const source = `https://stream.mux.com/${muxPlaybackID}.m3u8`;

    if (await checkStreamExists(source)) setVideoData(source);
    else log('error', 'No stream at endpoint');
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
    <div
      className={styles.wrapper}
      style={{ height: playerHeight, width: playerWidth }}
    >
      {videoData !== '' ? (
        <VideoPlayer
          src={videoData}
          height={playerHeight}
          width={playerWidth}
          muxMetaData={props.muxMetaData}
        />
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
