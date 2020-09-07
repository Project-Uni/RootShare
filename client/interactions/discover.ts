import { log, sendPacket } from '../helpers/functions';

import { User, Community } from '../models';

const NUM_RETRIEVED = 20;

export async function populateDiscoverForUser(userID: string) {
  const numUsers = Math.floor(Math.random() * 10) + 5;
  const numCommunities = NUM_RETRIEVED - numUsers;

  // const communitiesPromise = User.aggregate({ $match: { $not: {$in: {joinedCommunities: }} } });
  try {
    //getting connection ids for user
    const { connections, pendingConnections, university } = await User.findById(
      userID
    )
      .select(['connections', 'pendingConnections', 'university'])
      .exec();

    //Getting random sample of users that current user has not connected / requested to connect with
    const userPromise = User.aggregate([
      {
        $match: {
          $and: [
            { connections: { $not: { $in: connections } } },
            { pendingConnections: { $not: { $in: pendingConnections } } },
            { university: { $eq: university } },
          ],
        },
      },
      { $sample: { size: numUsers } },
      {
        $lookup: {
          from: 'universities',
          localField: 'university',
          foreignField: '_id',
          as: 'university',
        },
      },
      { $unwind: '$university' },
      {
        $project: {
          firstName: '$firstName',
          lastName: '$lastName',
          university: {
            _id: '$university._id',
            universityName: '$university.universityName',
          },
          work: '$work',
          position: '$position',
          graduationYear: '$graduationYear',
          profilePicture: '$profilePicture',
          joinedCommunities: '$joinedCommunities',
          connections: '$connections',
        },
      },
    ]).exec();

    //Getting random sample of communities that user has not joined / requested to join
    const communityPromise = Community.aggregate([
      {
        $match: {
          $and: [
            { members: { $not: { $eq: userID } } },
            { pendingMembers: { $not: { $eq: userID } } },
            { university: { $eq: university } },
          ],
        },
      },
      { $sample: { size: numCommunities } },
      {
        $lookup: {
          from: 'universities',
          localField: 'university',
          foreignField: '_id',
          as: 'university',
        },
      },
      { $unwind: '$university' },
      {
        $project: {
          name: '$name',
          type: '$type',
          description: '$description',
          private: '$private',
          members: '$members',
          profilePicture: '$profilePicture',
          university: {
            _id: '$university._id',
            universityName: '$university.universityName',
          },
        },
      },
    ]).exec();

    return Promise.all([communityPromise, userPromise])
      .then(([communities, users]) => {
        return sendPacket(
          1,
          'Successfully retrieved users and communities for population',
          { communities, users }
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
