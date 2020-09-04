import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import axios from 'axios';

import EventClientEmptyVideoPlayer from '../../video/EventClientEmptyVideoPlayer';
import VideoPlayer from '../../video/VideoPlayer';
import EventMobileHeader from './EventMobileHeader';

import { log } from '../../../../helpers/functions';
import { connect } from 'react-redux';
import {
  updateAccessToken,
  updateRefreshToken,
} from '../../../../redux/actions/token';
import { MuxMetaDataType } from '../../../../helpers/types';

const MOBILE_AD_CONTAINER_HEIGHT = 60;
const HEADER_HEIGHT = 60;

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
}));

type Props = {
  accessToken: string;
  refreshToken: string;
  updateAccessToken: (accessToken: string) => void;
  updateRefreshToken: (refreshToken: string) => void;
  muxPlaybackID: string;
  muxMetaData: MuxMetaDataType;
};

function EventWatcherMobile(props: Props) {
  const styles = useStyles();
  const [videoData, setVideoData] = useState('');
  const [playerWidth, setPlayerWidth] = useState(window.innerWidth);
  const [playerHeight, setPlayerHeight] = useState(
    window.innerHeight - MOBILE_AD_CONTAINER_HEIGHT - HEADER_HEIGHT
  );

  useEffect(() => {
    updateVideoData(props.muxPlaybackID);
    window.addEventListener('resize', handleResize);
  }, [props.muxPlaybackID]);

  function handleResize() {
    setPlayerWidth(window.innerWidth);
    setPlayerHeight(window.innerHeight - MOBILE_AD_CONTAINER_HEIGHT - HEADER_HEIGHT);
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
    <div className={styles.wrapper}>
      <EventMobileHeader />
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

export default connect(mapStateToProps, mapDispatchToProps)(EventWatcherMobile);
