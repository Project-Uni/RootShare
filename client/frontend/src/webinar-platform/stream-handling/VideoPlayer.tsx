import React from 'react';
import videojs from 'video.js'
import '../../../node_modules/video.js/dist/video-js.css'

interface Props {
  autoplay: boolean
  controls: boolean
  src: string
  type: string
}

export default class VideoPlayer extends React.Component<Props> {
  constructor(props: Props) {
    super(props)
  }
  player: any;
  videoNode: any;

  // componentDidUpdate() {
  //   console.log("PLAYER IS UPDATING")
  //   if (this.player) {
  //     this.player.dispose()
  //   }

  //   const videoPlayerOptions = {
  //     autoplay: this.props.autoplay,
  //     controls: this.props.controls,
  //     sources: [{
  //       src: this.props.src,
  //       type: this.props.type
  //     }]
  //   }
  //   this.player = videojs(this.videoNode, videoPlayerOptions, function onPlayerReady(this: any) {
  //     // console.log('onPlayerReady', this)
  //   });
  // }

  componentDidMount() {
    // instantiate Video.js
    console.log("COMPONENT MOUNTING")

    const videoPlayerOptions = {
      autoplay: this.props.autoplay,
      controls: this.props.controls,
      sources: [{
        src: this.props.src,
        type: this.props.type
      }]
    }
    this.player = videojs(this.videoNode, videoPlayerOptions, function onPlayerReady(this: any) {
      // console.log('onPlayerReady', this)
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