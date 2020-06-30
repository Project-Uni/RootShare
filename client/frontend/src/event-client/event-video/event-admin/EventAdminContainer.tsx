import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { CircularProgress } from '@material-ui/core';

import axios from 'axios';
import { connect } from 'react-redux';
import OT, { Session, Publisher } from '@opentok/client';

import EventAdminButtonContainer from './EventAdminButtonContainer';

import log from '../../../helpers/logger';
import RSText from '../../../base-components/RSText';
import { VideosOnlyLayout, ScreenshareLayout } from './EventSpeakerVideoLayouts';

import {
  connectStream,
  startLiveStream,
  stopLiveStream,
  createNewWebcamPublisher,
  createNewScreensharePublisher,
} from './EventAdminHelpers';

import { SINGLE_DIGIT } from '../../../types/types';

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
  loadingIndicator: {
    color: 'white',
  },
  loadingDiv: {
    height: '100%',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'white',
  },
}));

type Props = {
  user: { [key: string]: any };
};

function EventAdminContainer(props: Props) {
  const styles = useStyles();

  const [screenshareCapable, setScreenshareCapable] = useState(false);
  const [webcamPublisher, setWebcamPublisher] = useState(new Publisher());
  const [screenPublisher, setScreenPublisher] = useState(new Publisher());
  const [session, setSession] = useState(new Session());

  const [loading, setLoading] = useState(true);
  const [loadingErr, setLoadingErr] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [muted, setMuted] = useState(false);
  const [showWebcam, setShowWebcam] = useState(true);
  const [sharingScreen, setSharingScreen] = useState(false);

  const [webcamActive, setWebcamActive] = useState(false);

  const [numSpeakers, setNumSpeakers] = useState<SINGLE_DIGIT>(1);
  const [eventPos, setEventPos] = useState<SINGLE_DIGIT>(1);

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
    fetchEventInfo();
    initializeSession();
  }, []);

  function handleResize() {
    if (window.innerWidth >= MIN_WINDOW_WIDTH)
      setVideoWidth(window.innerWidth - EVENT_MESSAGES_CONTAINER_WIDTH);
    setVideoHeight(window.innerHeight - HEADER_HEIGHT - BUTTON_CONTAINER_HEIGHT);
  }

  async function fetchEventInfo() {
    setNumSpeakers(4);
    setEventPos(1);
  }

  function renderLoadingAndError() {
    return (
      <>
        {loading && !loadingErr && (
          <div className={styles.loadingDiv}>
            <CircularProgress size={100} className={styles.loadingIndicator} />
          </div>
        )}
        {loadingErr && (
          <div className={styles.loadingDiv}>
            <RSText type="subhead" className={styles.errorText} size={16}>
              There was an error loading this stream.
            </RSText>
          </div>
        )}
      </>
    );
  }

  function renderVideoSections() {
    if (!loading && !loadingErr) {
      if (sharingScreen)
        return <ScreenshareLayout numSpeakers={numSpeakers} sharingPos={eventPos} />;
      return <VideosOnlyLayout numSpeakers={numSpeakers} />;
    }
    return null;
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
        const publisher = createNewWebcamPublisher(
          props.user['firstName'] + ' ' + props.user['lastName'],
          eventPos
        );
        session.publish(publisher, (err) => {
          if (err) alert(err.message);
        });
        return publisher;
      } else {
        session.unpublish(webcamPublisher);
        return new Publisher();
      }
    });
    const isWebcamActive = showWebcam;
    setWebcamActive(isWebcamActive);
    setShowWebcam(!showWebcam);
  }

  function toggleScreenshare() {
    const prompt = `Are you sure you want to ${
      sharingScreen ? 'stop' : 'start'
    } sharing your screen`;

    const oldScreenShare = sharingScreen;

    if (window.confirm(prompt)) {
      if (webcamActive) toggleWebcam();
      if (!sharingScreen) setSharingScreen(true);

      setTimeout(() => {
        setScreenPublisher((prevState) => {
          if (session.sessionId === undefined) return new Publisher();
          if (prevState.session === undefined) {
            const publisher = createNewScreensharePublisher(
              props.user['firstName'] + ' ' + props.user['lastName'],
              eventPos
            );
            session.publish(publisher, (err) => {
              if (err) alert(err.message);
            });
            return publisher;
          } else if (prevState.session === null) return new Publisher();
          else {
            session.unpublish(screenPublisher);
            return new Publisher();
          }
        });

        // const endingScreenShare = sharingScreen;
        // if (frozenWebcamState && frozenSharingScreen)
        //   setTimeout(() => {
        //     toggleWebcam();
        //   }, 1000);
        // if (webcamActive && oldScreenShare) toggleWebcam();
        if (oldScreenShare) setSharingScreen(false);
      }, 1000);
    } else setSharingScreen(oldScreenShare);
  }

  async function initializeSession() {
    // TODO- This API call should be fetching the correct one for the event in prod
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

      setTimeout(() => {
        setLoading(false);
      }, 500);
    } else {
      log('error', 'Error connecting to session');
      setLoadingErr(true);
    }
  }

  return (
    <div className={styles.wrapper}>
      <div
        className={styles.videoContainer}
        id="videoContainer"
        style={{ height: videoHeight, width: videoWidth }}
      >
        {renderLoadingAndError()}
        {renderVideoSections()}
      </div>
      <EventAdminButtonContainer
        isStreaming={isStreaming}
        showWebcam={showWebcam}
        muted={muted}
        sharingScreen={sharingScreen}
        handleStreamStatusChange={handleStreamStatusChange}
        toggleWebcam={toggleWebcam}
        toggleMute={toggleMute}
        toggleScreenshare={toggleScreenshare}
        loading={loading}
      />
    </div>
  );
}

const mapStateToProps = (state: { [key: string]: any }) => {
  return {
    user: state.user,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(EventAdminContainer);
