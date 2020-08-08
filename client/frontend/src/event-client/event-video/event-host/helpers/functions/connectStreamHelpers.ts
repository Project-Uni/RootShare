import OT from '@opentok/client';
import { log, makeRequest } from '../../../../../helpers/functions';
import { createNewWebcamPublisher } from './createPublishers';

const { OPENTOK_API_KEY } = require('../../../../../keys.json');

export async function validateSession(
  webinarID: string,
  accessToken: string,
  refreshToken: string
) {
  const { data } = await makeRequest(
    'POST',
    '/webinar/getOpenTokSessionID',
    { webinarID },
    true,
    accessToken,
    refreshToken
  );
  if (data['success'] !== 1) {
    return false;
  }
  return data['content']['opentokSessionID'];
}

export async function getOpenTokToken(
  sessionID: string,
  accessToken: string,
  refreshToken: string
) {
  const { data } = await makeRequest(
    'POST',
    '/webinar/getOpenTokToken',
    {
      opentokSessionID: sessionID,
    },
    true,
    accessToken,
    refreshToken
  );
  if (data['success'] !== 1) {
    return false;
  }
  return data['content']['token'];
}

export async function createEventSession(
  sessionID: string,
  eventToken: string,
  updateVideoElements: (
    videoElement: HTMLVideoElement | HTMLObjectElement,
    videoType: 'camera' | 'screen',
    otherID: string,
    updateStateInHelper: (screenElementID: string) => void
  ) => void,
  removeVideoElement: (
    elementID: string,
    videoType: 'camera' | 'screen',
    self: boolean
  ) => void,
  setCameraPublisher: (newPublisher: OT.Publisher) => void,
  setPublisherLoading: (newLoading: boolean) => void,
  changeNumSpeakers: (value: 1 | -1) => void
) {
  const eventSession = OT.initSession(OPENTOK_API_KEY, sessionID);
  addEventSessionListeners(
    eventSession,
    updateVideoElements,
    removeVideoElement,
    changeNumSpeakers
  );

  await eventSession.connect(eventToken, (err: any) => {
    if (err) {
      log(err.name, err.message);
      return false;
    } else {
      log('info', 'Connected to event session');
      const publisher = createNewWebcamPublisher(
        'TODO: name does not insert here',
        updateVideoElements
      );

      eventSession.publish(publisher, (err) => {
        if (err) alert(err.message);
      });
      setCameraPublisher(publisher);
      setPublisherLoading(false);
      return eventSession;
    }
  });
  return eventSession;
}

function addEventSessionListeners(
  eventSession: any,
  updateVideoElements: (
    videoElement: HTMLVideoElement | HTMLObjectElement,
    videoType: 'camera' | 'screen',
    otherID: string,
    updateStateInHelper: (screenElementID: string) => void
  ) => void,
  removeVideoElement: (
    elementID: string,
    videoType: 'camera' | 'screen',
    self: boolean
  ) => void,
  changeNumSpeakers: (value: 1 | -1) => void
) {
  eventSession.on('streamCreated', (streamEvent: any) => {
    let subscriber = eventSession.subscribe(streamEvent.stream, {
      insertDefaultUI: false,
    });

    if (streamEvent.stream.videoType === 'camera') changeNumSpeakers(1);

    subscriber.on('videoElementCreated', function(event: any) {
      setTimeout(() => {
        updateVideoElements(
          event.element,
          streamEvent.stream.videoType,
          streamEvent.stream.streamId,
          () => {}
        );
      }, 500);
    });
  });

  eventSession.on('streamDestroyed', (event: any) => {
    removeVideoElement(event.stream.streamId, event.stream.videoType, false);
    if (event.stream.videoType === 'camera') changeNumSpeakers(-1);
  });
}
