import axios from 'axios';
import log from './logger';
import { JWT_TOKEN_FIELDS } from '../types/types';

type Config = {
  headers: {
    Authorization: string;
    user?: string;
  };
};

//TODO Update with deployed IPs
function getServerPath(serverName: string) {
  if (serverName === 'client') return 'http://localhost:8000';
  else if (serverName === 'balancer') return 'http://localhost:8001';
  else if (serverName === 'ranker') return 'http://localhost:8002';
  else if (serverName === 'webinarCache')
    return process.env.NODE_ENV === 'dev'
      ? 'http://localhost:8003'
      : 'https://cache.rootshare.io';
  else return 'ERROR';
}

export default function makeRequest(
  server: 'client' | 'balancer' | 'ranker' | 'webinarCache',
  route: String,
  method: 'GET' | 'POST' = 'GET',
  data: Object = {},
  authenticated: boolean = false,
  accessToken: string = '',
  refreshToken: string = '',
  user?: { _id: string; [key: string]: any }
) {
  const serverPath = getServerPath(server);
  if (serverPath == 'ERROR') {
    log('error', 'Invalid server path');
    return { success: 0, message: 'Invalid server path.' };
  }

  const config: Config = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };
  if (user) {
    if (user) {
      const userWithJWTFields = {};
      for (let i = 0; i < JWT_TOKEN_FIELDS.length; i++) {
        userWithJWTFields[JWT_TOKEN_FIELDS[i]] = user[JWT_TOKEN_FIELDS[i]];
      }
      config.headers.user = JSON.stringify(userWithJWTFields);
    }
  }

  if (method == 'GET') {
    return axios
      .get(`${serverPath}/${route}`, authenticated ? config : {})
      .then((res) => {
        return res.data;
      })
      .catch((error) => {
        log('error', error);
        return { success: -1, message: 'Error connecting to server' };
      });
  } else if (method == 'POST') {
    return axios
      .post(`${serverPath}/${route}`, data, authenticated ? config : {})
      .then((res) => {
        return res.data;
      })
      .catch((error) => {
        log('error', error);
        return { success: -1, message: 'Error connecting to server' };
      });
  } else {
    return { success: 0, message: 'Invalid http method.' };
  }
}
