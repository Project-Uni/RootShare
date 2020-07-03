import axios from 'axios';
import OT from '@opentok/client';
import log from '../../../helpers/logger';

import { SINGLE_DIGIT } from '../../../types/types';

//Ashwin - We should be storing this on the frontend I believe, I might be wrong. Not a good idea to pass it from outside of the frontend repo
const { OPENTOK_API_KEY } = require('../../../keys.json');

const VIDEO_UI_SETTINGS = {
  width: '100%',
  height: '100%',
};

export async function connectStream(
  webinarID: string,
  setSomeoneSharingScreen: (newState: false | SINGLE_DIGIT) => any,
  availablePositions: SINGLE_DIGIT[],
  eventStreamMap: { [key: string]: SINGLE_DIGIT },
  updateVideoElements: (
    arg0: HTMLVideoElement | HTMLObjectElement,
    arg1: 'camera' | 'screen',
    arg2: boolean
  ) => void
) {
  let canScreenshare = false;

  if (OT.checkSystemRequirements() !== 1) {
    alert('This browser is not yet supported.');
    return { screenshare: canScreenshare, eventSessin: false };
  }
  OT.checkScreenSharingCapability((response: any) => {
    if (response.supported && response.extensionRegistered) canScreenshare = true;
  });

  const sessionID = await validateSession(webinarID);
  if (!sessionID) return { screenshare: canScreenshare, eventSession: false };

  const eventToken = await getOpenTokToken(sessionID);
  if (!eventToken) return { screenshare: canScreenshare, eventSession: false };

  const eventSession = await createEventSession(
    sessionID,
    eventToken,
    setSomeoneSharingScreen,
    availablePositions,
    eventStreamMap,
    updateVideoElements
  );

  if (!((eventSession as unknown) as boolean))
    return { screenshare: canScreenshare, eventSession: false };

  return { screenshare: canScreenshare, eventSession: eventSession };
}

async function validateSession(webinarID: string) {
  const { data } = await axios.post('/webinar/getOpenTokSessionID', {
    webinarID,
  });
  if (data['success'] !== 1) {
    alert('Session token invalid');
    return false;
  }
  return data['content']['opentokSessionID'];
}

async function getOpenTokToken(sessionID: string) {
  const { data } = await axios.post('/webinar/getOpenTokToken', {
    opentokSessionID: sessionID,
  });
  if (data['success'] !== 1) {
    alert('Could not retrieve event token');
    return false;
  }
  return data['content']['token'];
}

async function createEventSession(
  sessionID: string,
  eventToken: string,
  setSomeoneSharingScreen: (newState: false | SINGLE_DIGIT) => any,
  availablePositions: SINGLE_DIGIT[],
  eventStreamMap: { [key: string]: SINGLE_DIGIT },
  updateVideoElements: (
    arg0: HTMLVideoElement | HTMLObjectElement,
    arg1: 'camera' | 'screen',
    arg2: boolean
  ) => void
) {
  const eventSession = OT.initSession(OPENTOK_API_KEY, sessionID);
  addEventSessionListeners(
    eventSession,
    availablePositions,
    eventStreamMap,
    setSomeoneSharingScreen,
    updateVideoElements
  );

  const connection = await eventSession.connect(eventToken, (err: any) => {
    if (err) {
      log(err.name, err.message);
      return false;
    } else {
      log('info', 'Connected to event session');
      return eventSession;
    }
  });
  return connection;
}

function addEventSessionListeners(
  eventSession: any,
  availablePositions: SINGLE_DIGIT[],
  eventStreamMap: { [key: string]: SINGLE_DIGIT },
  setSomeoneSharingScreen: (newState: false | SINGLE_DIGIT) => any,
  updateVideoElements: (
    arg0: HTMLVideoElement | HTMLObjectElement,
    arg1: 'camera' | 'screen',
    arg2: boolean
  ) => void
) {
  eventSession.on('streamCreated', (streamEvent: any) => {
    const pos = availablePositions.pop();
    console.log(streamEvent.stream.videoType);
    if (streamEvent.stream.videoType === 'screen')
      setSomeoneSharingScreen(pos as SINGLE_DIGIT);
    let subscriber = eventSession.subscribe(streamEvent.stream, {
      insertDefaultUI: false,
    });

    subscriber.on('videoElementCreated', function(event: any) {
      updateVideoElements(event.element, streamEvent.stream.videoType, false);
      console.log(`User number ${pos} Started Streaming`);
    });
    eventStreamMap[JSON.stringify(streamEvent.target)] = pos as SINGLE_DIGIT;
  });

  eventSession.on('streamDestroyed', (event: any) => {
    if (event.stream.videoType === 'screen') setSomeoneSharingScreen(false);
    const pos = eventStreamMap[JSON.stringify(event.target)];
    delete eventStreamMap[JSON.stringify(event.target)];
    availablePositions.push(pos);
  });
}

async function getLatestWebinarID() {
  const { data } = await axios.get('/webinar/latestWebinarID');
  if (data['success'] === 1) return data['content']['webinarID'];

  log('error', data['message']);
  return false;
}

export async function startLiveStream() {
  const webinarID = await getLatestWebinarID();
  axios.post('/webinar/startStreaming', { webinarID });
}

export async function stopLiveStream() {
  const webinarID = await getLatestWebinarID();
  axios.post('/webinar/stopStreaming', { webinarID });
}

// For styling guide refer to https://tokbox.com/developer/guides/customize-ui/js/

//TODO - If we decide not to use this function in the future, delete it
// function initializeWebcam(
//   eventSession: OT.Session,
//   name: string,
//   eventPos: SINGLE_DIGIT,
//   updateVideoElements: (arg0: HTMLVideoElement | HTMLObjectElement) => void
// ) {
//   const publisher = createNewWebcamPublisher(name, eventPos, updateVideoElements);
//   eventSession.publish(publisher, (err) => {
//     if (err) alert(err.message);
//   });
//   setTimeout(() => {
//     publisher.publishAudio(true);
//   }, 500);

//   return publisher;
// }

export function createNewWebcamPublisher(
  name: string,
  eventPos: SINGLE_DIGIT,
  updateVideoElements: (
    arg0: HTMLVideoElement | HTMLObjectElement,
    arg1: 'camera' | 'screen',
    arg2: boolean
  ) => void
) {
  const publisher = OT.initPublisher(
    ``,
    {
      insertDefaultUI: false,
      insertMode: 'append',
      name: name,
      // publishAudio: false,
      // publishVideo: false,
      ...VIDEO_UI_SETTINGS,
    },
    (err) => {
      if (err) alert(err.message);
    }
  );

  // TODO: this should be getting the user's own videoElement, so fix it to be mirrored
  publisher.on('videoElementCreated', function(event) {
    updateVideoElements(event.element, 'camera', true);
  });

  return publisher;
}

export function createNewScreensharePublisher(
  name: string,
  eventPos: SINGLE_DIGIT,
  updateVideoElements: (
    arg0: HTMLVideoElement | HTMLObjectElement,
    arg1: 'camera' | 'screen',
    arg2: boolean
  ) => void
) {
  const publisher = OT.initPublisher(
    ``,
    {
      insertDefaultUI: false,
      videoSource: 'screen',
      insertMode: 'append',
      name: name,
      ...VIDEO_UI_SETTINGS,
    },
    (err) => {
      if (err) {
        log('error', err.message);
      }
    }
  );

  publisher.on('videoElementCreated', function(event) {
    updateVideoElements(event.element, 'screen', true);
  });

  return publisher;
}
