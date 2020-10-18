import axios from 'axios';
import { getStore } from '../../redux/store/persistedStore';

type Config = {
  headers: {
    Authorization: string;
  };
};

const store = getStore();

export function makeRequest(
  method: 'GET' | 'POST',
  url: string,
  data: { [key: string]: any } = {},
  ...rest: any
) {
  const state = store.getState();
  const { accessToken, refreshToken } = state;

  const config: Config = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };

  if (method === 'GET') return axios.get(url, ( accessToken && refreshToken ) ? config : {});
  return axios.post(url, data, ( accessToken && refreshToken ) ? config : {});
}
