import axios from 'axios';

type Config = {
  headers: {
    Authorization: string;
  };
};

export function makeRequest(
  method: 'GET' | 'POST',
  url: string,
  data: { [key: string]: any } = {},
  authenticated = false,
  accessToken = '',
  refreshToken = ''
) {
  const config: Config = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };
  if (method === 'GET') return axios.get(url, authenticated ? config : {});
  return axios.post(url, data, authenticated ? config : {});
}
