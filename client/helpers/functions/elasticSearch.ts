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
      'duration-seconds': { type: 'float' },
    },
  },
};

export const initialize = async () => {
  log('info', 'Initializing Elastic Search');
  const res = await Promise.all(
    Object.keys(Indexes).map((indexKey) => {
      createIndex(Indexes[indexKey]);
    })
  );
  log('info', 'Finished initializing elastic search');
};

//We can specify body for specific indexes
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
    else logElasticError(err);
  }
};

const createElasticLog = async (
  path: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  response: {
    success: number;
    message: string;
    duration: number;
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
        'duration-seconds': response.duration,
        message: response.message,
        env: process.env.NODE_ENV,
      },
    });
    log('info', 'Sent log');
  } catch (err) {
    logElasticError(err);
  }
};

export const elasticMiddleware = (req, res, next) => {
  const oldWrite = res.write;
  const oldEnd = res.end;

  const chunks = [];

  const startTime = process.hrtime();

  res.write = (...restArgs) => {
    chunks.push(Buffer.from(restArgs[0]));
    oldWrite.apply(res, restArgs);
  };

  res.end = (...restArgs) => {
    if (restArgs[0]) {
      chunks.push(Buffer.from(restArgs[0]));
    }
    const body = Buffer.concat(chunks).toString('utf8');
    try {
      const parsedBody = JSON.parse(JSON.parse(JSON.stringify(body.toString()))); //This would not work unless I had this level of depth lol

      if (parsedBody)
        createElasticLog(
          req.url,
          req.method,
          {
            success: parsedBody.success,
            message: parsedBody.message,
            duration: accurateTimeDifferenceMS(startTime) / 1000,
          },
          req.method !== 'GET' ? removeSensitiveData(req.body) : undefined
        );
    } catch (err) {
      //Handling cases where request is a page render
    }

    oldEnd.apply(res, restArgs);
  };

  next();
};

//ELASTIC DELETE WRAPPERS

//Dont use this unless you have to, this will delete all logs with a certain index
const deleteIndex = async (index: string) => {
  try {
    await client.indices.delete({ index });
    log('info', `Successfully deleted index: ${index}`);
  } catch (err) {
    log('error', err.message);
  }
};

//Used to delete a specific log using query
export const deleteLogById = async (id: string, index: string) => {
  try {
    const res = await client.delete({ id, index });
    return res;
  } catch (err) {
    logElasticError(err);
    return false;
  }
};

//You can use this to cleanup if you add a sensitive field by mistake
export const deleteLogsWithField = async (index: string, field: string) => {
  try {
    const res = await client.deleteByQuery({
      index,
      body: {
        query: {
          query_string: {
            query: `*${field}*`,
            default_field: 'reqBody',
          },
        },
      },
    });
    return res;
  } catch (err) {
    logElasticError(err);
    return false;
  }
};

// DOCS - https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-delete-by-query.html
// https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html
export const deleteLogByQuery = async (
  index: string,
  query: { [key: string]: any }
) => {
  try {
    const res = await client.deleteByQuery({ index, body: query });
    return res;
  } catch (err) {
    logElasticError(err);
    return false;
  }
};

//ELASTIC HELPERS

const removeSensitiveData = (requestBody: { [key: string]: any }) => {
  const keys = Object.keys(requestBody).filter(
    (key) => !SensitiveKeys.some((sensitiveKey) => key.includes(sensitiveKey))
  );
  return Object.assign({}, ...keys.map((key) => ({ [key]: requestBody[key] })));
};

const SensitiveKeys = ['password'];

const accurateTimeDifferenceMS = (startTime: [number, number]) => {
  const NS_PER_SEC = 1e9;
  const NS_TO_MS = 1e6;
  const diff = process.hrtime(startTime);

  return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS;
};

const logElasticError = (err) => {
  console.log(err.meta.body.error.root_cause);
};
