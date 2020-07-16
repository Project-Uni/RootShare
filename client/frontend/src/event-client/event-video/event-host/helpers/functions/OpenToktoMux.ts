import axios from 'axios';
import log from '../../../../../helpers/logger';
import { makeRequest } from '../../../../../helpers/makeRequest';

async function getLatestWebinarID() {
  const { data } = await axios.get('/webinar/latestWebinarID');
  if (data['success'] === 1) return data['content']['webinarID'];

  log('error', data['message']);
  return false;
}

export async function startLiveStream(accessToken: string, refreshToken: string) {
  const webinarID = await getLatestWebinarID();
  makeRequest(
    'POST',
    '/webinar/startStreaming',
    { webinarID },
    true,
    accessToken,
    refreshToken
  );
}

export async function stopLiveStream(accessToken: string, refreshToken: string) {
  const webinarID = await getLatestWebinarID();
  makeRequest(
    'POST',
    '/webinar/stopStreaming',
    { webinarID },
    true,
    accessToken,
    refreshToken
  );
}
