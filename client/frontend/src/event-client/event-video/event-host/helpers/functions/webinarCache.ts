import { makeRequest } from '../../../../../helpers/makeRequest';

//TODO - Move server base URL to env for easy switching between dev and prod
export async function addToCache(
  webinarID: string,
  accessToken: string,
  refreshToken: string
) {
  const { data } = await makeRequest(
    'POST',
    `${
      process.env.NODE_ENV === 'development'
        ? 'http://localhost:8003'
        : 'http://localhost:8003'
    }/api/createWebinar`,
    { webinarID },
    true,
    accessToken,
    refreshToken
  );
  console.log('Response:', data['message']);
}

export async function removeFromCache(
  webinarID: string,
  accessToken: string,
  refreshToken: string
) {
  const { data } = await makeRequest(
    'POST',
    `${
      process.env.NODE_ENV === 'development'
        ? 'http://localhost:8003'
        : 'http://localhost:8003'
    }/api/removeWebinar`,
    { webinarID },
    true,
    accessToken,
    refreshToken
  );
  console.log('Response:', data['message']);
}
