import axios, { AxiosResponse } from 'axios';
import { getStore } from '../../redux/store/persistedStore';

type Config = {
  headers: {
    Authorization: string;
  };
};

export function makeRequest<T = { [key: string]: any }>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  data: { [key: string]: any } = {},
  ...rest: any
): Promise<AxiosResponse<{ success: -1 | 0 | 1; message: string; content: T }>> {
  const store = getStore();
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
  }
}
