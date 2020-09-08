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
          const cleanedUser = await cleanUser(
            connections,
            joinedCommunities,
            users[i]
          );

          users[i] = cleanedUser;
        }

        //Cleaning communities array
        for (let i = 0; i < communities.length; i++) {
          const mutualMembers = connections.filter((connection) => {
            return communities[i].members.indexOf(connection) !== -1;
          });

          //Getting profile picture
          let profilePicture = undefined;
          if (communities[i].profilePicture) {
            try {
              const signedImageURL = await retrieveSignedUrl(
                'communityProfile',
                communities[i].profilePicture
              );
              if (signedImageURL) profilePicture = signedImageURL;
            } catch (err) {
              log('error', err);
            }
          }

          const cleanedCommunity = {
            name: communities[i].name,
            type: communities[i].type,
            description: communities[i].description,
            private: communities[i].private,
            university: communities[i].university,
            profilePicture,
            numMembers: communities[i].members.length,
            numMutual: mutualMembers.length,
          };

          communities[i] = cleanedCommunity;
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

async function cleanUser(
  currentUserConnections,
  currentUserJoinedCommunities,
  otherUser: {
    firstName: string;
    lastName: string;
    university: { _id: string; universityName: string };
    work: string;
    position: string;
    graduationYear: number;
    profilePicture?: string;
    connections: string[];
    joinedCommunities: string[];
  }
) {
  //Calculating mutual connections and communities
  const mutualConnections = currentUserConnections.filter((connection) => {
    return otherUser.connections.indexOf(connection) !== -1;
  });
  const mutualCommunities = currentUserJoinedCommunities.filter((community) => {
    return otherUser.joinedCommunities.indexOf(community) !== -1;
  });

  //Getting profile picture
  let profilePicture = undefined;
  if (otherUser.profilePicture) {
    try {
      const signedImageURL = await retrieveSignedUrl(
        'profile',
        otherUser.profilePicture
      );
      if (signedImageURL) profilePicture = signedImageURL;
    } catch (err) {
      log('error', err);
    }
  }

  const cleanedUser = {
    firstName: otherUser.firstName,
    lastName: otherUser.lastName,
    university: otherUser.university,
    work: otherUser.work,
    position: otherUser.position,
    graduationYear: otherUser.graduationYear,
    profilePicture,
    numMutualConnections: mutualConnections.length,
    numMutualCommunities: mutualCommunities.length,
  };

  return cleanedUser;
}
