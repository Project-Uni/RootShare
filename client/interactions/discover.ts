const mongoose = require('mongoose');

import { log, sendPacket } from '../helpers/functions';
import {
  addCalculatedCommunityFields,
  addCalculatedUserFields,
  generateSignedImagePromises,
  connectionsToUserIDStrings,
} from '../interactions/utilities';

import { User, Community } from '../models';
import { createSearch } from '../models/searches';

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
      .populate({ path: 'connections', select: ['accepted', 'from', 'to'] })
      .exec();

    if (!user) return sendPacket(0, 'No user found with provided ID');
    const { connections, pendingConnections, university, joinedCommunities } = user;

    //Getting random sample of users that current user has not connected / requested to connect with
    const userPromise = User.aggregate([
      {
        $match: {
          $and: [
            { _id: { $not: { $eq: mongoose.Types.ObjectId(userID) } } },
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
        $lookup: {
          from: 'connections',
          localField: 'connections',
          foreignField: '_id',
          as: 'connections',
        },
      },
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
        const connectionUserIDs = connectionsToUserIDStrings(userID, connections);

        //Cleaning users array
        for (let i = 0; i < users.length; i++) {
          users[i].connections = connectionsToUserIDStrings(
            users[i]._id,
            users[i].connections
          );

          const cleanedUser = await addCalculatedUserFields(
            connectionUserIDs,
            joinedCommunities,
            users[i]
          );
          users[i] = cleanedUser;
        }

        //Cleaning communities array
        for (let i = 0; i < communities.length; i++) {
          const cleanedCommunity = await addCalculatedCommunityFields(
            connectionUserIDs,
            communities[i]
          );
          communities[i] = cleanedCommunity;
        }

        const imageInfo = await addCommunityAndUserImages(communities, users);

        return sendPacket(1, `Pre-populated discovery page for user ${userID}`, {
          communities: imageInfo['communities'],
          users: imageInfo['users'],
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

export async function exactMatchSearchFor(
  userID: string,
  query: string,
  limit: number = 20
) {
  const cleanedQuery = query.trim();

  createSearch(userID, query);

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
    const userPromise = User.find({
      $and: [
        // { _id: { $not: { $eq: mongoose.Types.ObjectId(userID) } } },
        { $or: userSearchConditions },
      ],
    })
      .select(['firstName', 'lastName', 'email', 'profilePicture'])
      .limit(limit)
      .lean()
      .exec();

    const communityPromise = Community.find({
      name: new RegExp(cleanedQuery, 'gi'),
    })
      .select([
        'name',
        'type',
        'description',
        'private',
        'profilePicture',
        'university',
      ])
      .limit(limit)
      .lean()
      .exec();

    return Promise.all([userPromise, communityPromise])
      .then(async ([users, communities]) => {
        const imageInfo = await addCommunityAndUserImages(communities, users);

        return sendPacket(
          1,
          `Successfully retrieved all matching users and communities for query: ${query}`,
          {
            communities: imageInfo['communities'],
            users: imageInfo['users'],
          }
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

function addCommunityAndUserImages(communities, users) {
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
        else communities[i].profilePicture = undefined;

      for (i; i < communities.length + users.length; i++)
        if (images[i]) users[i - communities.length].profilePicture = images[i];
        else users[i - communities.length].profilePicture = undefined;

      return { communities, users };
    })
    .catch((err) => {
      log('error', err);
      for (let i = 0; i < communities.length; i++) {
        const imageURL = communities[i].profilePicture;
        if (
          !imageURL ||
          typeof imageURL !== 'string' ||
          imageURL.length < 4 ||
          imageURL.substring(0, 4) !== 'http'
        )
          communities[i].profilePicture = undefined;
      }

      for (let i = 0; i < users.length; i++) {
        const imageURL = users[i].profilePicture;
        if (
          !imageURL ||
          typeof imageURL !== 'string' ||
          imageURL.length < 4 ||
          imageURL.substring(0, 4) !== 'http'
        )
          users[i].profilePicture = undefined;
      }

      return { communities, users };
    });
}
