import React from 'react';
import videojs from 'video.js'
import '../../../node_modules/video.js/dist/video-js.css'

interface Props {
  src: string
}

export default class VideoPlayer extends React.Component<Props> {
  constructor(props: Props) {
    super(props)
  }
  player: any;
  videoNode: any;

  componentDidMount() {
    const videoPlayerOptions = {
      autoplay: true,
      controls: true,
      sources: [{
        src: this.props.src,
        type: 'application/x-mpegURL'
      }]
    }

    try {
      this.player = videojs(this.videoNode, videoPlayerOptions, function onPlayerReady(this: any) {
        // Handle on player ready here
      })
    } catch (err) {
      // Handle error here
    }

    this.player.on('error', function () {
      // Catch further errors here
    });
  }

  // destroy player on unmount
  componentWillUnmount() {
    if (this.player) {
      this.player.dispose()
    }
  }

  // wrap the player in a div with a `data-vjs-player` attribute
  // so videojs won't create additional wrapper in the DOM
  // see https://github.com/videojs/video.js/pull/3856
  render() {
    return (
      <div>
        <div data-vjs-player>
          <video ref={node => this.videoNode = node} className="video-js"></video>
        </div>
      </div>
    )
  }
}