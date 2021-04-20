import React from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import '@videojs/themes/dist/fantasy/index.css';
import 'videojs-mux';
import moment from 'moment';

import { MuxMetaDataType } from '../../../helpers/types';

import { RootShareVideoPoster } from '../../../images/events';

require('dotenv').config();

const MUX_DATA_ENV_KEY =
  process.env.NODE_ENV === 'development'
    ? process.env.REACT_APP_MUX_DATA_ENV_KEY_DEV
    : process.env.REACT_APP_MUX_DATA_ENV_KEY_PROD;

interface Props {
  src: string;
  width: number;
  height: number;
  muxMetaData: MuxMetaDataType;
  eventImage: string;
}

export default class VideoPlayer extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }
  player: any;
  videoNode: any;

  componentDidMount() {
    const videoPlayerOptions = {
      autoplay: false,
      controls: true,
      preload: 'auto',
      poster: this.props.eventImage || RootShareVideoPoster,
      sources: [
        {
          src: this.props.src,
          type: 'application/x-mpegURL',
        },
      ],
    };

    try {
      const { muxMetaData } = this.props;
      this.player = videojs(
        this.videoNode,
        videoPlayerOptions,
        function onPlayerReady(this: any) {
          // Handle on player ready here
        }
      );

      this.player.mux({
        debug: true,
        data: {
          env_key: MUX_DATA_ENV_KEY,

          // Site Metadata
          viewer_user_id: muxMetaData.viewerUserID, // ex: '12345'
          // experiment_name: '', // ex: 'player_test_A'
          // sub_property_id: '', // ex: 'cus-1'

          // Player Metadata
          player_name: 'RootShare Event Player', // ex: 'My Main Player'
          player_version: '1.0.0', // ex: '1.0.0'
          player_init_time: moment(new Date()).format('YYYYMMDDHHMMSS'), // ex: 1451606400000

          // Video Metadata (cleared with 'videochange' event)
          video_id: muxMetaData.webinarID, // ex: 'abcd123'
          video_title: muxMetaData.eventTitle, // ex: 'My Great Video'
          // video_series: '', // ex: 'Weekly Great Videos'
          // video_duration: '', // in milliseconds, ex: 120000
          // video_stream_type: '', // 'live' or 'on-demand'
          video_cdn: 'Video.js', // ex: 'Fastly', 'Akamai'
        },
      });

      this.player.landscapeFullscreen({
        fullscreen: {
          enterOnRotate: true,
          alwaysInLandscapeMode: true,
          iOS: true,
        },
      });
    } catch (err) {
      // Handle error here
    }

    this.player.on('error', function() {
      // Catch further errors here
    });
  }

  // destroy player on unmount
  componentWillUnmount() {
    if (this.player) {
      this.player.dispose();
    }
  }

  // wrap the player in a div with a `data-vjs-player` attribute
  // so videojs won't create additional wrapper in the DOM
  // see https://github.com/videojs/video.js/pull/3856

  render() {
    const fs: boolean = !!document.fullscreenElement;
    const videoWidth = fs ? '100%' : this.props.width;
    const videoHeight = fs ? '100%' : this.props.height;

    return (
      <div>
        <div data-vjs-player style={{ width: videoWidth, height: videoHeight }}>
          <video
            ref={(node) => (this.videoNode = node)}
            className="video-js vjs-theme-fantasy"
            style={{ width: videoWidth, height: videoHeight }}
          ></video>
        </div>
      </div>
    );
  }
}
