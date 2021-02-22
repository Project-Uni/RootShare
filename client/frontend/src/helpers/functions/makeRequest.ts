import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getStore } from '../../redux/store/persistedStore';

type HttpResponse<T> = {
  success: -1 | 0 | 1;
  message: string;
  content: T;
};

export async function makeRequest<T = { [key: string]: any }>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  data?: { [key: string]: any },
  ...rest: any
): Promise<AxiosResponse<HttpResponse<T>>> {
  const { accessToken, refreshToken } = getStore().getState();

  const config: AxiosRequestConfig = {
    headers: {
      Authorization:
        accessToken && refreshToken ? `Bearer ${accessToken}` : undefined,
    },
    method,
    url,
    data,
  };

  try {
    let response: AxiosResponse<HttpResponse<T>> = await axios(config);
    return response;
  } catch (err) {
    let error = err as AxiosError;
    return error.response as AxiosResponse<HttpResponse<T>>;
  }
}
