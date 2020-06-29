import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Button } from '@material-ui/core';

import OT, { Session, Publisher } from '@opentok/client';

import {
  Video,
  VideoOff,
  Microphone,
  MicrophoneOff,
} from '@styled-icons/boxicons-solid';

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
  videoContainer: {
    width: 900,
    height: 630,
    background: 'black',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'flex-start',
    marginTop: 10,
  },
  buttonDefault: {
    marginLeft: 8,
    //TODO - Change once color scheme is updated
    backgroundColor: '#3D66DE',
    color: 'white',
    '&:hover': {
      //TODO - Change once color scheme is updated
      backgroundColor: '#4272E6',
    },
  },
  cameraIcon: {},
}));

type Props = {};

function EventAdminContainer(props: Props) {
  const styles = useStyles();

  const [canScreenShare, setCanScreenShare] = useState(false);
  const [webcamPublisher, setWebcamPublisher] = useState(new Publisher());
  const [screenPublisher, setScreenPublisher] = useState(new Publisher());
  const [session, setSession] = useState(new Session());

  const [isStreaming, setIsStreaming] = useState(false);
  const [muted, setMuted] = useState(false);
  const [showWebcam, setShowWebcam] = useState(true);

  function handleStreamStatusChange() {
    if (isStreaming) {
      if (window.confirm('Are you sure you want to end the live stream?'))
        setIsStreaming(false);
    } else {
      if (window.confirm('Are you sure you want to begin the live stream?'))
        setIsStreaming(true);
    }
  }

  function toggleMute() {
    setMuted(!muted);
  }
  function toggleWebcam() {
    setShowWebcam(!showWebcam);
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.videoContainer}></div>
      <div className={styles.buttonContainer}>
        <Button
          variant="contained"
          onClick={handleStreamStatusChange}
          className={[styles.buttonDefault].join(' ')}
        >
          {!isStreaming ? 'Begin Live Stream' : 'End Live Stream'}
        </Button>
        <Button
          className={[styles.buttonDefault, styles.cameraIcon].join(' ')}
          onClick={toggleWebcam}
        >
          {/* <BsCameraVideoFill color="white" size={24} /> */}
          {showWebcam ? (
            <Video size={28} color="white" />
          ) : (
            <VideoOff size={28} color="white" />
          )}
        </Button>
        <Button
          className={[styles.buttonDefault, styles.cameraIcon].join(' ')}
          onClick={toggleMute}
        >
          {!muted ? (
            <Microphone color="white" size={26} />
          ) : (
            <MicrophoneOff color="white" size={26} />
          )}
        </Button>
        <Button
          variant="contained"
          className={[styles.buttonDefault, styles.cameraIcon].join(' ')}
        >
          Share Screen
        </Button>
        <Button
          variant="contained"
          className={[styles.buttonDefault, styles.cameraIcon].join(' ')}
        >
          Manage Speakers
        </Button>
      </div>
    </div>
  );
}

export default EventAdminContainer;
