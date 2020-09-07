import { log, sendPacket, retrieveSignedUrl } from '../helpers/functions';

import { User, Community } from '../models';

const NUM_RETRIEVED = 20;

export async function populateDiscoverForUser(userID: string) {
  const numUsers = Math.floor(Math.random() * 4) + 12;
  const numCommunities = NUM_RETRIEVED - numUsers;

  try {
    //getting connection ids for user
    const {
      connections,
      pendingConnections,
      university,
      joinedCommunities,
    } = await User.findById(userID)
      .select([
        'connections',
        'pendingConnections',
        'university',
        'joinedCommunities',
      ])
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
      .then(async ([communities, users]) => {
        //Cleaning users array
        for (let i = 0; i < users.length; i++) {
          //Calculating mutual connections and communities
          const mutualConnections = connections.filter((connection) => {
            return users[i].connections.indexOf(connection) !== -1;
          });
          const mutualCommunities = joinedCommunities.filter((community) => {
            return users[i].joinedCommunities.indexOf(community) !== -1;
          });

          //Getting profile picture
          let profilePicture = undefined;
          if (users[i].profilePicture) {
            try {
              const signedImageURL = await retrieveSignedUrl(
                'profile',
                users[i].profilePicture
              );
              if (signedImageURL) profilePicture = signedImageURL;
            } catch (err) {
              log('error', err);
            }
          }

          const cleanedUser = {
            firstName: users[i].firstName,
            lastName: users[i].lastName,
            university: users[i].university,
            work: users[i].work,
            position: users[i].position,
            graduationYear: users[i].graduationYear,
            profilePicture: profilePicture,
            numMutualConnections: mutualConnections.length,
            numMutualCommunities: mutualCommunities.length,
          };

          users[i] = cleanedUser;
        }

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
