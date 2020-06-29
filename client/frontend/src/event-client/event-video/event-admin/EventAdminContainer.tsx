import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import axios from 'axios';
import OT, { Session, Publisher } from '@opentok/client';

import EventAdminButtonContainer from './EventAdminButtonContainer';

import log from '../../../helpers/logger';

import {
  connectStream,
  startLiveStream,
  stopLiveStream,
  createNewWebcamPublisher,
} from './EventAdminHelpers';

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

  const [screenshareCapable, setScreenshareCapable] = useState(false);
  const [webcamPublisher, setWebcamPublisher] = useState(new Publisher());
  const [screenPublisher, setScreenPublisher] = useState(new Publisher());
  const [session, setSession] = useState(new Session());

  const [isStreaming, setIsStreaming] = useState(false);
  const [muted, setMuted] = useState(false);
  const [showWebcam, setShowWebcam] = useState(true);
  const [sharingScreen, setSharingScreen] = useState(false);
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
    //ONLY DO THIS FOR DEV, it should be fetch session for release
    createNewSession();
  }, []);

  function handleResize() {
    if (window.innerWidth >= MIN_WINDOW_WIDTH)
      setVideoWidth(window.innerWidth - EVENT_MESSAGES_CONTAINER_WIDTH);
    setVideoHeight(window.innerHeight - HEADER_HEIGHT - BUTTON_CONTAINER_HEIGHT);
  }

  function handleStreamStatusChange() {
    if (isStreaming) {
      if (window.confirm('Are you sure you want to end the live stream?')) {
        setIsStreaming(false);
        stopLiveStream();
      }
    } else {
      if (window.confirm('Are you sure you want to begin the live stream?')) {
        setIsStreaming(true);
        startLiveStream();
      }
    }
  }

  function toggleMute() {
    setMuted(!muted);
  }
  function toggleWebcam() {
    setWebcamPublisher((prevState) => {
      if (session.sessionId === undefined) return new Publisher();
      if (prevState.session === undefined) {
        const publisher = createNewWebcamPublisher();
        session.publish(publisher, (err) => {
          if (err) alert(err.message);
        });
        return publisher;
      } else {
        session.unpublish(webcamPublisher);
        return new Publisher();
      }
    });
    setShowWebcam(!showWebcam);
  }

  function toggleScreenshare() {
    setSharingScreen(!sharingScreen);
  }

  async function createNewSession() {
    //This API call should be fetching the correct one for the event in prod
    const { data } = await axios.get('/webinar/createSession');

    if (data['success'] === 1) {
      const { screenshare, eventSession } = await connectStream(
        data['content']['webinarID']
      );
      setScreenshareCapable(screenshare);
      if (!eventSession) {
        alert('DEV: INVALID CONNECTION. Redirect to other page');
        return;
      }
      setSession((eventSession as unknown) as OT.Session);
    } else log('error', 'Error connecting to session');
  }

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
        sharingScreen={sharingScreen}
        handleStreamStatusChange={handleStreamStatusChange}
        toggleWebcam={toggleWebcam}
        toggleMute={toggleMute}
        toggleScreenshare={toggleScreenshare}
      />
    </div>
  );
}

export default EventAdminContainer;
