import { Client, RequestParams, ApiResponse, errors } from '@elastic/elasticsearch';
const {
  ELASTIC_CLIENT_ID,
  ELASTIC_USERNAME,
  ELASTIC_PASSWORD,
} = require('../../../keys/keys.json');

import { log } from './';
import { sendPacket } from './sendPacket';

const client = new Client({
  cloud: {
    id: ELASTIC_CLIENT_ID,
  },
  // node: 'https://f6a6c4f99fc943d28ba77c13d9e166b3.us-east-1.aws.found.io:9243',
  auth: {
    username: ELASTIC_USERNAME,
    password: ELASTIC_PASSWORD,
  },
});

const initializeIndex = (index: string, callback: () => void) => {
  client.indices.create(
    {
      index,
    },
    (err) => {
      if (err) log('info', `Found log index: ${index}`);
      else log('info', `Creating log index: ${index}`);
      callback();
    }
  );
};

export const initialize = async () => {
  initializeIndex('v0_service_logs', () =>
    createElasticLog(
      '/',
      'GET',
      sendPacket(0, 'Testing!'),
      sendPacket(-1, 'Other testing')
    )
  );
};

export const createElasticLog = (
  path: string,
  method: string,
  response: {
    success: number;
    content?: { [key: string]: any };
    message: string;
  },
  requestBody?: { [key: string]: any }
) => {
  const requestBodyFormatted = requestBody ? JSON.stringify(requestBody) : undefined;
  const responseFormatted = {
    success: response.success,
    message: response.success,
    content: response.content ? JSON.stringify(response.content) : undefined,
  };

  client.index(
    {
      index: 'v1_service_logs',
      type: 'service_log',
      body: {
        path,
        method,
        timestamp: new Date(),
        reqBody: requestBodyFormatted,
        response: responseFormatted,
      },
    },
    (err, resp) => {
      console.log('Error:', err);
      console.log('Data:', resp);
    }
  );
};

initialize();
