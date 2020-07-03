import axios from 'axios';
import OT from '@opentok/client';
import log from '../../../../../helpers/logger';

import { SINGLE_DIGIT } from '../../../../../types/types';
//Ashwin - We should be storing this on the frontend I believe, I might be wrong. Not a good idea to pass it from outside of the frontend repo
const { OPENTOK_API_KEY } = require('../../../../../keys.json');

const VIDEO_UI_SETTINGS = {
  width: '100%',
  height: '100%',
};

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
  setSomeoneSharingScreen: (newState: false | SINGLE_DIGIT) => any,
  availablePositions: SINGLE_DIGIT[],
  eventStreamMap: { [key: string]: SINGLE_DIGIT }
) {
  const eventSession = OT.initSession(OPENTOK_API_KEY, sessionID);
  addEventSessionListeners(
    eventSession,
    availablePositions,
    eventStreamMap,
    setSomeoneSharingScreen
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
  setSomeoneSharingScreen: (newState: false | SINGLE_DIGIT) => any
) {
  eventSession.on('streamCreated', (event: any) => {
    const pos = availablePositions.pop();
    if (event.stream.videoType === 'screen')
      setSomeoneSharingScreen(pos as SINGLE_DIGIT);
    eventSession.subscribe(event.stream, `pos${pos}`, {
      insertMode: 'append',
      ...VIDEO_UI_SETTINGS,
    });
    eventStreamMap[JSON.stringify(event.target)] = pos as SINGLE_DIGIT;
  });

  eventSession.on('streamDestroyed', (event: any) => {
    if (event.stream.videoType === 'screen') setSomeoneSharingScreen(false);
    const pos = eventStreamMap[JSON.stringify(event.target)];
    delete eventStreamMap[JSON.stringify(event.target)];
    availablePositions.push(pos);
  });
}
