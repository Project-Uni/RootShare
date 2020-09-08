import { log, sendPacket, retrieveSignedUrl } from '../helpers/functions';

import { User, Community } from '../models';

const MAX_RETRIEVED = 20;

export async function populateDiscoverForUser(userID: string) {
  const numUsers = Math.floor(Math.random() * 4) + 12;
  const numCommunities = MAX_RETRIEVED - numUsers;

  try {
    //getting connection ids for user
    const user = await User.findById(userID)
      .select([
        'connections',
        'pendingConnections',
        'university',
        'joinedCommunities',
      ])
      .exec();

    if (!user) return sendPacket(0, 'No user found with provided ID');
    const { connections, pendingConnections, university, joinedCommunities } = user;

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
          pendingConnections: '$pendingConnections',
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
          const cleanedCommunity = await cleanCommunity(connections, communities[i]);
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

export async function exactMatchSearchFor(userID: string, query: string) {
  const USER_LIMIT = 15;
  const COMMUNITY_LIMIT = 5;

  const cleanedQuery = query.trim();
  if (cleanedQuery.length < 3)
    return sendPacket(0, 'Query is too short to provide accurate search');

  const terms = query.split(' ');
  const userSearchConditions: { [key: string]: any }[] = [];
  if (terms.length === 1) {
    userSearchConditions.push({ firstName: new RegExp(terms[0], 'gi') });
    userSearchConditions.push({ email: new RegExp(terms[0], 'gi') });
    userSearchConditions.push({ lastName: new RegExp(terms[0], 'gi') });
  } else {
    userSearchConditions.push({
      $and: [
        { firstName: new RegExp(terms[0], 'gi') },
        { lastName: new RegExp(terms[1], 'gi') },
      ],
    });
  }

  try {
    const currentUserPromise = User.findById(userID)
      .select([
        'connections',
        'pendingConnections',
        'joinedCommunities',
        'pendingCommunities',
      ])
      .exec();

    const userPromise = User.find({ $or: userSearchConditions })
      .select([
        'firstName',
        'lastName',
        'university',
        'work',
        'position',
        'graduationYear',
        'profilePicture',
        'joinedCommunities',
        'connections',
        'pendingConnections',
      ])
      .limit(USER_LIMIT)
      .populate({ path: 'university', select: ['universityName'] })
      .exec();

    const communityPromise = Community.find({
      name: new RegExp(cleanedQuery, 'gi'),
    })
      .select([
        'name',
        'type',
        'description',
        'private',
        'members',
        'profilePicture',
        'university',
      ])
      .limit(COMMUNITY_LIMIT)
      .populate({ path: 'university', select: ['universityName'] })
      .exec();

    return Promise.all([currentUserPromise, userPromise, communityPromise])
      .then(async ([currentUser, users, communities]) => {
        if (!currentUser) return sendPacket(0, 'Could not find current user entry');

        for (let i = 0; i < users.length; i++) {
          const cleanedUser = await cleanUser(
            currentUser.connections,
            currentUser.joinedCommunities,
            users[i]
          );
          getUserToUserState(
            currentUser.connections,
            currentUser.pendingConnections,
            users[i],
            cleanedUser
          );
          users[i] = cleanedUser;
        }

        //Cleaning communities array
        for (let i = 0; i < communities.length; i++) {
          const cleanedCommunity = await cleanCommunity(
            currentUser.connections,
            communities[i]
          );
          communities[i] = cleanedCommunity;
        }

        return sendPacket(
          1,
          'Successfully retrieved all users and communities for query',
          { users, communities }
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

//HELPERS

async function cleanUser(
  currentUserConnections: string[],
  currentUserJoinedCommunities: string[],
  otherUser: {
    _id: string;
    firstName: string;
    lastName: string;
    university: { _id: string; universityName: string };
    work: string;
    position: string;
    graduationYear: number;
    profilePicture?: string;
    connections: string[];
    pendingConnections: string[];
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
    _id: otherUser._id,
    firstName: otherUser.firstName,
    lastName: otherUser.lastName,
    university: otherUser.university,
    work: otherUser.work,
    position: otherUser.position,
    graduationYear: otherUser.graduationYear,
    profilePicture,
    numMutualConnections: mutualConnections.length,
    numMutualCommunities: mutualCommunities.length,
    status: 'PUBLIC',
  };

  return cleanedUser;
}

async function cleanCommunity(
  currentUserConnections: string[],
  community: {
    _id: string;
    name: string;
    type: string;
    description: string;
    private: boolean;
    university: { _id: string; universityName: string };
    profilePicture?: string;
    members: string[];
  }
) {
  const mutualMembers = currentUserConnections.filter((connection) => {
    return community.members.indexOf(connection) !== -1;
  });

  //Getting profile picture
  let profilePicture = undefined;
  if (community.profilePicture) {
    try {
      const signedImageURL = await retrieveSignedUrl(
        'communityProfile',
        community.profilePicture
      );
      if (signedImageURL) profilePicture = signedImageURL;
    } catch (err) {
      log('error', err);
    }
  }

  const cleanedCommunity = {
    _id: community._id,
    name: community.name,
    type: community.type,
    description: community.description,
    private: community.private,
    university: community.university,
    profilePicture,
    numMembers: community.members.length,
    numMutual: mutualMembers.length,
  };

  return cleanedCommunity;
}

async function getUserToUserState(
  currentUserConnections,
  currentUserPendingConnections,
  originalOtherUser: {
    _id: string;
    firstName: string;
    lastName: string;
    university: { _id: string; universityName: string };
    work: string;
    position: string;
    graduationYear: number;
    profilePicture?: string;
    connections: string[];
    pendingConnections: string[];
    joinedCommunities: string[];
  },
  cleanedOtherUser: {
    _id: string;
    firstName: string;
    lastName: string;
    university: { _id: string; universityName: string };
    work: string;
    position: string;
    graduationYear: number;
    profilePicture: string;
    numMutualConnections: number;
    numMutualCommunities: number;
    status: string;
  }
) {
  for (let i = 0; i < currentUserConnections.length; i++) {
    if (originalOtherUser.connections.indexOf(currentUserConnections[i]) !== -1) {
      cleanedOtherUser.status = 'CONNECTION';
      return;
    }
  }

  for (let i = 0; i < currentUserPendingConnections.length; i++) {
    if (
      originalOtherUser.pendingConnections.indexOf(
        currentUserPendingConnections[i]
      ) !== -1
    ) {
      cleanedOtherUser.status = 'PENDING';
      return;
    }
  }
}
