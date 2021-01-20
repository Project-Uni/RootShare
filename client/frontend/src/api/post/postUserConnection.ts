import { makeRequest } from '../../helpers/functions';

export const postUpdatetUserConnection = async () => {
  console.log('Hello:');
  const { data } = await makeRequest('POST', '/');
};
