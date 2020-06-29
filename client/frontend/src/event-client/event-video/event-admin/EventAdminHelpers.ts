import axios from 'axios';
import OT, { Session, Publisher } from '@opentok/client';
import log from '../../../helpers/logger';

//Ashwin - We should be storing this on the frontend I believe, I might be wrong. Not a good idea to pass it from outside of the frontend repo
const { OPENTOK_API_KEY } = require('../../../keys.json');

export async function connectStream(webinarID: string) {
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

  const eventSession = await createEventSession(sessionID, eventToken);

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

async function createEventSession(sessionID: string, eventToken: string) {
  const eventSession = OT.initSession(OPENTOK_API_KEY, sessionID);
  eventSession.on('streamCreated', (event: any) => {
    eventSession.subscribe(event.stream);
  });

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

export function createNewWebcamPublisher() {
  const publisher = OT.initPublisher(
    'publisher',
    {
      insertMode: 'append',
      width: '10%',
      height: '200px',
    },
    (err) => {
      if (err) alert(err.message);
    }
  );
  return publisher;
}

export function createNewScreensharePublisher() {
  const publisher = OT.initPublisher(
    'screen-preview',
    { videoSource: 'screen' },
    (err) => {
      if (err) alert(err.message);
    }
  );
  return publisher;
}
