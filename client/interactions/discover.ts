import { log, sendPacket } from '../helpers/functions';
import {
  addCalculatedCommunityFields,
  addCalculatedUserFields,
  generateSignedImagePromises,
  getUserToCommunityRelationship,
  getUserToUserRelationship,
} from '../interactions/utilities';

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
          admin: '$admin',
        },
      },
    ]).exec();

    return Promise.all([communityPromise, userPromise])
      .then(async ([communities, users]) => {
        //Cleaning users array
        for (let i = 0; i < users.length; i++) {
          const cleanedUser = await addCalculatedUserFields(
            connections,
            joinedCommunities,
            users[i]
          );
          users[i] = cleanedUser;
        }

        //Cleaning communities array
        for (let i = 0; i < communities.length; i++) {
          const cleanedCommunity = await addCalculatedCommunityFields(
            connections,
            communities[i]
          );
          communities[i] = cleanedCommunity;
        }

        const communityImagePromises = generateSignedImagePromises(
          communities,
          'communityProfile'
        );
        const userImagePromises = generateSignedImagePromises(users, 'profile');

        return Promise.all([...communityImagePromises, ...userImagePromises])
          .then((images) => {
            let i = 0;
            for (i; i < communities.length; i++)
              if (images[i]) communities[i].profilePicture = images[i];

            for (i; i < communities.length + users.length; i++)
              if (images[i])
                users[i - communities.length].profilePicture = images[i];
            log('info', `Pre-populated discovery page for user ${userID}`);

            return sendPacket(
              1,
              'Successfully retrieved users and communities for population',
              { communities, users }
            );
          })
          .catch((err) => {
            log('error', err);
            return sendPacket(
              1,
              'Successfully retrieved users and communities, but there was an error retrieving profile images',
              { communities, user }
            );
          });
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
    try {
      userSearchConditions.push({ firstName: new RegExp(terms[0], 'gi') });
      userSearchConditions.push({ email: new RegExp(terms[0], 'gi') });
      userSearchConditions.push({ lastName: new RegExp(terms[0], 'gi') });
    } catch (err) {
      log(
        'error',
        `There was an error with the regular expression made from the query: ${err}`
      );
      return sendPacket(
        -1,
        'There was an error with the regular expression made from the query'
      );
    }
  } else {
    try {
      userSearchConditions.push({
        $and: [
          { firstName: new RegExp(terms[0], 'gi') },
          { lastName: new RegExp(terms[1], 'gi') },
        ],
      });
    } catch (err) {
      log(
        'error',
        `There was an error with the regular expression made from the query: ${err}`
      );
      return sendPacket(
        -1,
        'There was an error with the regular expression made from the query'
      );
    }
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
        'pendingCommunities',
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
        'admin',
      ])
      .limit(COMMUNITY_LIMIT)
      .populate({ path: 'university', select: ['universityName'] })
      .exec();

    return Promise.all([currentUserPromise, userPromise, communityPromise])
      .then(async ([currentUser, users, communities]) => {
        if (!currentUser) return sendPacket(0, 'Could not find current user entry');

        for (let i = 0; i < users.length; i++) {
          const cleanedUser = await addCalculatedUserFields(
            currentUser.connections,
            currentUser.joinedCommunities,
            users[i]
          );
          getUserToUserRelationship(
            currentUser.connections,
            currentUser.pendingConnections,
            users[i],
            cleanedUser
          );
          users[i] = cleanedUser;
        }

        //Cleaning communities array
        for (let i = 0; i < communities.length; i++) {
          const cleanedCommunity = await addCalculatedCommunityFields(
            currentUser.connections,
            communities[i]
          );
          getUserToCommunityRelationship(
            currentUser.joinedCommunities,
            currentUser.pendingCommunities,
            communities[i],
            cleanedCommunity
          );
          communities[i] = cleanedCommunity;
        }

        const communityImagePromises = generateSignedImagePromises(
          communities,
          'communityProfile'
        );
        const userImagePromises = generateSignedImagePromises(users, 'profile');

        return Promise.all([...communityImagePromises, ...userImagePromises])
          .then((images) => {
            let i = 0;
            for (i; i < communities.length; i++)
              if (images[i]) communities[i].profilePicture = images[i];

            for (i; i < communities.length + users.length; i++)
              if (images[i])
                users[i - communities.length].profilePicture = images[i];

            log(
              'info',
              `Successfully retrieved all matching users and communities for query: ${query}`
            );

            return sendPacket(
              1,
              'Successfully retrieved all users and communities for query',
              { users, communities }
            );
          })
          .catch((err) => {
            log('error', err);
            return sendPacket(
              1,
              'Successfully retrieved discover search, but there was an error retrieving images',
              { users, communities }
            );
          });
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
