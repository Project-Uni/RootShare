import axios from 'axios';
import OT from '@opentok/client';
import log from '../../../../../helpers/logger';
import { createNewWebcamPublisher } from './createPublishers';
import { makeRequest } from '../../../../../helpers/makeRequest';

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
    alert('Session token invalid');
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
    alert('Could not retrieve event token');
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
  increaseNumSpeakers: () => void
) {
  const eventSession = OT.initSession(OPENTOK_API_KEY, sessionID);
  addEventSessionListeners(
    eventSession,
    updateVideoElements,
    removeVideoElement,
    increaseNumSpeakers
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
  increaseNumSpeakers: () => void
) {
  eventSession.on('streamCreated', (streamEvent: any) => {
    let subscriber = eventSession.subscribe(streamEvent.stream, {
      insertDefaultUI: false,
    });

    if (streamEvent.stream.videoType === 'camera') increaseNumSpeakers();

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
  });
}
