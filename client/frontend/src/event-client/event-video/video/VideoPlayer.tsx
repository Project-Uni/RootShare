import React from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import '@videojs/themes/dist/fantasy/index.css';

interface Props {
  src: string;
  width: number;
  height: number;
}

export default class VideoPlayer extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }
  player: any;
  videoNode: any;

  componentDidMount() {
    const videoPlayerOptions = {
      autoplay: true,
      controls: true,
      sources: [
        {
          src: this.props.src,
          type: 'application/x-mpegURL',
        },
      ],
    };

    try {
      this.player = videojs(
        this.videoNode,
        videoPlayerOptions,
        function onPlayerReady(this: any) {
          // Handle on player ready here
        }
      );
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
        <div data-vjs-player>
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
