import { makeRequest } from '../../../../../helpers/makeRequest';

export async function startLiveStream(
  webinarID: string,
  accessToken: string,
  refreshToken: string
) {
  const { data } = await makeRequest(
    'POST',
    '/webinar/startStreaming',
    { webinarID },
    true,
    accessToken,
    refreshToken
  );
  return data['success'] === 1;
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
