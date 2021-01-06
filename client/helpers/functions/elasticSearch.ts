import { Client } from '@elastic/elasticsearch';
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

const Indexes = {
  ServiceLogIndex: 'general-v2',
};

const DefaultIndexBody = {
  mappings: {
    properties: {
      path: { type: 'text' },
      method: { type: 'text' },
      timestamp: { type: 'date' },
      reqBody: { type: 'text' },
      success: { type: 'long' },
      message: { type: 'text' },
      content: { type: 'text' },
    },
  },
};

const LogBuffer = [];
const MaxBufferLen = 5;

//We can generalize body for specific indexes
const createIndex = async (
  index: string,
  body: { mappings: { properties: { [key: string]: any } } } = DefaultIndexBody
) => {
  try {
    await client.indices.create({
      index,
      body,
    });
    log('info', `Creating log index: ${index}`);
  } catch (err) {
    if (err.message.includes('resource_already_exists_exception'))
      log('info', `Found log index: ${index}`);
    else log('error', err.message);
  }
};

//Dont use this unless you have to, this will delete all logs with a certain index
const deleteIndex = async (index: string) => {
  try {
    await client.indices.delete({ index });
    log('info', `Successfully deleted index: ${index}`);
  } catch (err) {
    log('error', err.message);
  }
};

export const initialize = async () => {
  const res = await Promise.all(
    Object.keys(Indexes).map((indexKey) => {
      createIndex(Indexes[indexKey]);
    })
  );
  // await createIndex(Indexes.ServiceLogIndex);

  //Additional
  await createElasticLog(
    '/',
    'GET',
    sendPacket(0, 'Testing!'),
    sendPacket(-1, 'Other testing')
  );
  client.close();
};

export const createElasticLog = async (
  path: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  response: {
    success: number;
    content?: { [key: string]: any };
    message: string;
  },
  requestBody?: { [key: string]: any }
) => {
  try {
    await client.index({
      index: Indexes.ServiceLogIndex,
      type: 'service_log',
      body: {
        path,
        method,
        timestamp: new Date(),
        reqBody: requestBody ? JSON.stringify(requestBody) : undefined,
        success: Math.floor(response.success),
        message: response.message,
        content: response.content ? JSON.stringify(response.content) : undefined,
        env: process.env.NODE_ENV,
      },
    });
    log('info', 'Sent log');
  } catch (err) {
    console.log(err.meta.body.error.root_cause);
  }
};

initialize().then(() => {
  console.log('Done');
});
