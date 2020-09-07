import { log, sendPacket } from '../helpers/functions';

import { User, Community } from '../models';

const NUM_RETRIEVED = 20;

export async function populateDiscoverForUser(userID: string) {
  const numUsers = Math.floor(Math.random() * 10) + 5;
  const numCommunities = NUM_RETRIEVED - numUsers;

  // const communitiesPromise = User.aggregate({ $match: { $not: {$in: {joinedCommunities: }} } });
  try {
    const communityPromise = Community.aggregate([
      {
        $match: {
          $and: [
            { members: { $not: { $eq: userID } } },
            { pendingMembers: { $not: { $eq: userID } } },
          ],
        },
      },
      { $sample: { size: numCommunities } },
    ])
      .select([
        'name',
        'type',
        'description',
        'private',
        'members',
        'profilePicture',
      ])
      .exec();

    return Promise.all([communityPromise])
      .then(([communities]) => {
        return sendPacket(
          1,
          'Successfully retrieved users and communities for population',
          { communities }
        );
      })
      .catch((err) => {
        log('error', err);
        return sendPacket(-1, err);
      });
  } catch (err) {
    log('error', err);
    return sendPacket(-1, err);
  }
}
