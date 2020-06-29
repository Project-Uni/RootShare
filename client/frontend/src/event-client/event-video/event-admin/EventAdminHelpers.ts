import axios from 'axios';
import OT, { Session, Publisher } from '@opentok/client';
import log from '../../../helpers/logger';

const { OPENTOK_API_KEY } = require('../../../keys.json');

export async function connectStream(webinarID: string) {
  let canScreenshare = false;

  if (OT.checkSystemRequirements() !== 1) {
    alert('This browser is not yet supported.');
    return { screenshare: canScreenshare, eventSessin: false };
  }
  OT.checkScreenSharingCapability((response: any) => {
    if (response.supported && response.extensionRegistered)
      // setScreenshareCapable(true);
      canScreenshare = true;
  });

  const sessionID = await validateSession(webinarID);
  if (!sessionID) return { screenshare: canScreenshare, eventSession: false };

  const eventToken = await getOpenTokToken(sessionID);
  if (!eventToken) return { screenshare: canScreenshare, eventSession: false };

  const eventSession = await createEventSession(sessionID, eventToken);
  if (!eventSession) return { screenshare: canScreenshare, eventSession: false };

  return { screenshare: canScreenshare, eventSession: eventSession };
}

export async function validateSession(webinarID: string) {
  //const {data: sessionData} =
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

export async function createEventSession(sessionID: string, eventToken: string) {
  const eventSession = OT.initSession(OPENTOK_API_KEY, sessionID);
  eventSession.on('streamCreated', (event: any) => {
    eventSession.subscribe(event.stream);
  });

  await eventSession.connect(eventToken, (err: any) => {
    if (err) {
      log('error', err.message);
      return false;
    } else {
      log('info', 'Connected to event session');
      return eventSession;
    }
  });
  return false;
}
