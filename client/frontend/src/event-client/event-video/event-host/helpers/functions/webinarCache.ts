import { makeRequest, log } from '../../../../../helpers/functions';

export async function addToCache(
  webinarID: string,
  accessToken: string,
  refreshToken: string
) {
  const { data } = await makeRequest(
    'POST',
    '/proxy/addWebinarToCache',
    { webinarID },
    true,
    accessToken,
    refreshToken
  );
  log('info', `Server Response: ${data['message']}`);
}

export async function removeFromCache(
  webinarID: string,
  accessToken: string,
  refreshToken: string
) {
  const { data } = await makeRequest(
    'POST',
    '/proxy/removeWebinarFromCache',
    { webinarID },
    true,
    accessToken,
    refreshToken
  );
  log('info', `Server Response: ${data['message']}`);
}
