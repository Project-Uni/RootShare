import axios from 'axios';
import OT from '@opentok/client';
import log from '../../../../../helpers/logger';
import { createNewWebcamPublisher } from './createPublishers';

export async function validateSession(webinarID: string) {
  const { data } = await axios.post('/webinar/getOpenTokSessionID', {
    webinarID,
  });
  if (data['success'] !== 1) {
    alert('Session token invalid');
    return false;
  }
  return data['content']['opentokSessionID'];
}

export async function getOpenTokToken(sessionID: string) {
  const { data } = await axios.post('/webinar/getOpenTokToken', {
    opentokSessionID: sessionID,
  });
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
  setCameraPublisher: (newPublisher: OT.Publisher) => void
) {
  let eventSession: OT.Session;
  if (process.env.REACT_APP_OPENTOK_API_KEY) {
    eventSession = OT.initSession(process.env.REACT_APP_OPENTOK_API_KEY, sessionID);
  } else return;
  addEventSessionListeners(eventSession, updateVideoElements, removeVideoElement);

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
  ) => void
) {
  eventSession.on('streamCreated', (streamEvent: any) => {
    let subscriber = eventSession.subscribe(streamEvent.stream, {
      insertDefaultUI: false,
    });

    subscriber.on('videoElementCreated', function(event: any) {
      updateVideoElements(
        event.element,
        streamEvent.stream.videoType,
        streamEvent.stream.streamId,
        () => {}
      );
    });
  });

  eventSession.on('streamDestroyed', (event: any) => {
    removeVideoElement(event.stream.streamId, event.stream.videoType, false);
  });
}
