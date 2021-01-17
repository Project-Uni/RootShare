import { makeRequest, log } from '../../../../../helpers/functions';

export async function addToCache(webinarID: string) {
  const { data } = await makeRequest('POST', '/proxy/addWebinarToCache', {
    webinarID,
  });
  log('info', `Server Response: ${data['message']}`);
}

export async function removeFromCache(webinarID: string) {
  const { data } = await makeRequest('POST', '/proxy/removeWebinarFromCache', {
    webinarID,
  });
  log('info', `Server Response: ${data['message']}`);
}
