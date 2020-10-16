import axios from 'axios';
import { getStore } from '../../redux/store/persistedStore';

type Config = {
  headers: {
    Authorization: string;
  };
};

const store = getStore();

export function makeRequest(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
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

  switch (method) {
    case 'GET':
      return axios.get(url, accessToken && refreshToken ? config : {});
    case 'POST':
      return axios.post(url, data, accessToken && refreshToken ? config : {});
    case 'PUT':
      return axios.put(url, data, accessToken && refreshToken ? config : {});
    case 'DELETE':
      return axios.delete(url, accessToken && refreshToken ? config : {});
    default:
      return { data: { success: -1, message: 'Invalid HTTP method' } };
  }
}
