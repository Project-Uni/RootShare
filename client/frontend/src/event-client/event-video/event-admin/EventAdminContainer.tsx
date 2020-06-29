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

import EventAdminButtonContainer from './EventAdminButtonContainer';

const MIN_WINDOW_WIDTH = 1100;
const EVENT_MESSAGES_CONTAINER_WIDTH = 300;
const HEADER_HEIGHT = 60;
const BUTTON_CONTAINER_HEIGHT = 50;

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    minWidth: MIN_WINDOW_WIDTH - EVENT_MESSAGES_CONTAINER_WIDTH,
  },
  videoContainer: {
    background: 'black',
    marginBottom: 0,
  },
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
  const [videoWidth, setVideoWidth] = useState(
    window.innerWidth >= MIN_WINDOW_WIDTH
      ? window.innerWidth - EVENT_MESSAGES_CONTAINER_WIDTH
      : MIN_WINDOW_WIDTH - EVENT_MESSAGES_CONTAINER_WIDTH
  );
  const [videoHeight, setVideoHeight] = useState(
    window.innerHeight - HEADER_HEIGHT - BUTTON_CONTAINER_HEIGHT
  );

  useEffect(() => {
    window.addEventListener('resize', handleResize);
  }, []);

  function handleResize() {
    if (window.innerWidth >= MIN_WINDOW_WIDTH)
      setVideoWidth(window.innerWidth - EVENT_MESSAGES_CONTAINER_WIDTH);
    setVideoHeight(window.innerHeight - HEADER_HEIGHT - BUTTON_CONTAINER_HEIGHT);
  }

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

  // Ashwin - ALL WEBCAM AND SCREEN RECORDING FUNCTIONALITY BELOW THIS POINT

  // Ashwin - END OF WEBCAM AND SCREEN RECORDING FUNCTIONALITY

  return (
    <div className={styles.wrapper}>
      <div
        className={styles.videoContainer}
        style={{ height: videoHeight, width: videoWidth }}
      ></div>
      <EventAdminButtonContainer
        isStreaming={isStreaming}
        showWebcam={showWebcam}
        muted={muted}
        handleStreamStatusChange={handleStreamStatusChange}
        toggleWebcam={toggleWebcam}
        toggleMute={toggleMute}
      />
    </div>
  );
}

export default EventAdminContainer;
