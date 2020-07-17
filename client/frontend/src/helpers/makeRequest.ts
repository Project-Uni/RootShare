import axios from 'axios';
export function makeRequest(
  method: 'GET' | 'POST',
  url: string,
  data: { [key: string]: any } = {},
  authenticated = false,
  accessToken = '',
  refreshToken = ''
) {
  const config = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };
  if (method === 'GET') return axios.get(url, authenticated ? config : {});
  return axios.post(url, data, authenticated ? config : {});
}
