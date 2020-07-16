import { makeRequest } from '../../../../../helpers/makeRequest';

export async function startLiveStream(
  webinarID: string,
  accessToken: string,
  refreshToken: string
) {
  makeRequest(
    'POST',
    '/webinar/startStreaming',
    { webinarID },
    true,
    accessToken,
    refreshToken
  );
}

export async function stopLiveStream(
  webinarID: string,
  accessToken: string,
  refreshToken: string
) {
  makeRequest(
    'POST',
    '/webinar/stopStreaming',
    { webinarID },
    true,
    accessToken,
    refreshToken
  );
}
