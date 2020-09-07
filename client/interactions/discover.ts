import { log, sendPacket } from '../helpers/functions';

import { User, Community } from '../models';

const NUM_RETRIEVED = 20;

export function populateDiscoverForUser(userID: string) {
  const numUsers = Math.floor(Math.random() * 10) + 5;
  const numCommunities = NUM_RETRIEVED - numUsers;
  return sendPacket(1, 'Test worked');
}
