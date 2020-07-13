import axios from 'axios';
import log from '../../../../../helpers/logger';

export async function startLiveStream(webinarID: string) {
  axios.post('/webinar/startStreaming', { webinarID });
}

export async function stopLiveStream(webinarID: string) {
  axios.post('/webinar/stopStreaming', { webinarID });
}
