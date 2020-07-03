import axios from 'axios';
import log from '../../../../../helpers/logger';

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
