import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { CircularProgress } from '@material-ui/core';

import { connect } from 'react-redux';
import OT, { Session, Publisher } from '@opentok/client';
import { updateAccessToken, updateRefreshToken } from '../../../redux/actions/token';

import EventHostButtonContainer from './EventHostButtonContainer';

import log from '../../../helpers/logger';
import { makeRequest } from '../../../helpers/makeRequest';

import RSText from '../../../base-components/RSText';
import {
  VideosOnlyLayout,
  ScreenshareLayout,
} from '../video/EventOpenTokVideoLayout';

import {
  connectStream,
  startLiveStream,
  stopLiveStream,
  createNewScreensharePublisher,
  addToCache,
  removeFromCache,
} from './helpers';

import { SINGLE_DIGIT } from '../../../types/types';

const MIN_WINDOW_WIDTH = 1100;
const EVENT_MESSAGES_CONTAINER_WIDTH = 350;
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
  accessToken: string;
  refreshToken: string;
  updateAccessToken: (accessToken: string) => void;
  updateRefreshToken: (refreshToken: string) => void;
  mode: 'speaker' | 'admin';
  webinar: { [key: string]: any };
};

function EventHostContainer(props: Props) {
  const styles = useStyles();

  const [screenshareCapable, setScreenshareCapable] = useState(false);
  const [cameraPublisher, setCameraPublisher] = useState(new Publisher());
  const [screenPublisher, setScreenPublisher] = useState(new Publisher());
  const [session, setSession] = useState(new Session());
  const [webinarID, setWebinarID] = useState(-1);

  const [loading, setLoading] = useState(true);
  const [loadingErr, setLoadingErr] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [muted, setMuted] = useState(true);
  const [showWebcam, setShowWebcam] = useState(false);
  const [sharingScreen, setSharingScreen] = useState(false);
  const [someoneSharingScreen, setSomeoneSharingScreen] = useState('');

  const [numSpeakers, setNumSpeakers] = useState<SINGLE_DIGIT>(1);

  const [videoData, setVideoData] = useState({
    videoElements: new Array<HTMLVideoElement | HTMLObjectElement>(),
    cameraElementID: '',
    screenElementID: '',
    nextID: 0,
  });

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
    initializeSession();
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
        // stopLiveStream(props.webinar['_id'], props.accessToken, props.refreshToken);
        removeFromCache(props.webinar['_id'], props.accessToken, props.refreshToken);
      }
    } else {
      if (window.confirm('Are you sure you want to begin the live stream?')) {
        setIsStreaming(true);
        // startLiveStream(props.webinar['_id'], props.accessToken, props.refreshToken);
        addToCache(props.webinar['_id'], props.accessToken, props.refreshToken);
      }
    }
  }

  function toggleMute() {
    setMuted((prevMuted) => {
      if (prevMuted) cameraPublisher.publishAudio(true);
      else cameraPublisher.publishAudio(false);
      return !prevMuted;
    });
  }

  function changeNumSpeakers(value: 1 | -1) {
    setNumSpeakers((prevState) => {
      return (prevState + value) as SINGLE_DIGIT;
    });
  }

  async function updateVideoElements(
    element: HTMLVideoElement | HTMLObjectElement,
    videoType: 'camera' | 'screen',
    otherID: string,
    updateStateInHelper: (
      screenElementID: string,
      session: Session,
      screenPublisher: Publisher
    ) => void
  ) {
    await setVideoData((prevVideoData) => {
      if (otherID === '') {
        const nextID = prevVideoData.nextID;
        const updateNextID = nextID < Number.MAX_SAFE_INTEGER ? nextID + 1 : 0;
        element.setAttribute('elementid', `${nextID}`);

        if (videoType === 'screen') {
          setSomeoneSharingScreen(`${nextID}`);
          setSharingScreen(true);
          updateStateInHelper(`${nextID}`, session, screenPublisher);
        }

        return {
          videoElements: prevVideoData.videoElements.concat(element),
          cameraElementID:
            videoType === 'camera' ? `${nextID}` : prevVideoData.cameraElementID,
          screenElementID:
            videoType === 'screen' ? `${nextID}` : prevVideoData.screenElementID,
          nextID: updateNextID,
        };
      } else {
        element.setAttribute('elementid', otherID);
        if (videoType === 'screen') setSomeoneSharingScreen(otherID);

        return {
          videoElements: prevVideoData.videoElements.concat(element),
          cameraElementID: prevVideoData.cameraElementID,
          screenElementID: prevVideoData.screenElementID,
          nextID: prevVideoData.nextID,
        };
      }
    });
  }

  function removeVideoElement(
    elementID: string,
    videoType: 'camera' | 'screen',
    self: boolean
  ) {
    if (videoType === 'screen') {
      setSomeoneSharingScreen('');
      if (self) setSharingScreen(false);
    }

    setVideoData((prevVideoData) => {
      const listLength = prevVideoData.videoElements.length;
      let elementIndex = -1;
      for (let i = 0; i < listLength; i++) {
        const currElement = prevVideoData.videoElements[i];
        if (currElement.getAttribute('elementid') === elementID) {
          elementIndex = i;
        }
      }

      const newVideoElements =
        elementIndex === -1
          ? prevVideoData.videoElements
          : prevVideoData.videoElements
              .slice(0, elementIndex)
              .concat(
                prevVideoData.videoElements.slice(elementIndex + 1, listLength)
              );

      return {
        videoElements: newVideoElements,
        cameraElementID:
          self && videoType === 'camera' ? '' : prevVideoData.cameraElementID,
        screenElementID:
          self && videoType === 'screen' ? '' : prevVideoData.screenElementID,
        nextID: prevVideoData.nextID,
      };
    });
  }

  function toggleWebcam() {
    setShowWebcam((prevWebcam) => {
      if (prevWebcam) cameraPublisher.publishVideo(false);
      else cameraPublisher.publishVideo(true);
      return !prevWebcam;
    });
  }

  function toggleScreenshare() {
    if (!sharingScreen && someoneSharingScreen) {
      window.alert(`Can't share screen while someone else is`);
      return;
    }

    const prompt = `Are you sure you want to ${
      sharingScreen ? 'stop' : 'start'
    } sharing your screen`;

    if (window.confirm(prompt)) {
      setTimeout(() => {
        setScreenPublisher((prevState) => {
          if (session.sessionId === undefined) {
            return new Publisher();
          }
          if (prevState.session === undefined || prevState.session === null) {
            const publisher = createNewScreensharePublisher(
              props.user['firstName'] + ' ' + props.user['lastName'],
              updateVideoElements,
              screenShareTearDown
            );

            session.publish(publisher, (err) => {
              if (err) return log('error', err.message);
              makeRequest(
                'POST',
                '/webinar/changeBroadcastLayout',
                {
                  webinarID,
                  type: 'horizontalPresentation',
                  streamID: publisher.stream?.streamId,
                },
                true,
                props.accessToken,
                props.refreshToken
              );

              setScreenPublisher(publisher);
            });

            return new Publisher();
          } else {
            return screenShareTearDown(
              videoData.screenElementID,
              session,
              screenPublisher
            );
          }
        });
      }, 500);
    }
  }

  async function handleManageSpeakers() {}

  function screenShareTearDown(
    screenElementID: string,
    session: Session,
    screenPublisher: Publisher
  ) {
    setTimeout(() => {
      makeRequest(
        'POST',
        '/webinar/changeBroadcastLayout',
        {
          webinarID,
          type: 'bestFit',
        },
        true,
        props.accessToken,
        props.refreshToken
      );

      removeVideoElement(screenElementID, 'screen', true);
      session.unpublish(screenPublisher);
    }, 500);
    return new Publisher();
  }

  async function initializeSession() {
    if (props.webinar) {
      setWebinarID(props.webinar['_id']);
      const { screenshare, eventSession } = await connectStream(
        props.webinar['_id'],
        updateVideoElements,
        removeVideoElement,
        setCameraPublisher,
        changeNumSpeakers,
        props.accessToken,
        props.refreshToken
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
      return someoneSharingScreen === '' ? (
        <VideosOnlyLayout
          numSpeakers={numSpeakers}
          videoElements={videoData.videoElements}
        />
      ) : (
        <ScreenshareLayout
          numSpeakers={numSpeakers}
          videoElements={videoData.videoElements}
          sharingPos={someoneSharingScreen}
        />
      );
    }
    return null;
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
      <EventHostButtonContainer
        mode={props.mode}
        isStreaming={isStreaming}
        showWebcam={showWebcam}
        muted={muted}
        sharingScreen={sharingScreen}
        handleStreamStatusChange={handleStreamStatusChange}
        handleManageSpeakers={handleManageSpeakers}
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

export default connect(mapStateToProps, mapDispatchToProps)(EventHostContainer);
