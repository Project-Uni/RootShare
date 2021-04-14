import { Types } from 'mongoose';

import {
  User,
  Community,
  Search,
  IConnection,
  ICommunity,
  IDocument,
  IUser,
  Connection,
} from '../rootshare_db/models';
import { SidebarData } from '../rootshare_db/types';
import { log, sendPacket } from '../helpers/functions';
import {
  addCalculatedCommunityFields,
  addCalculatedUserFields,
  generateSignedProfilePromises,
  connectionsToUserIDStrings,
} from '../interactions/utilities';
import { retrieveAllUrls } from './media';

const ObjectIdVal = Types.ObjectId;
type ObjectIdType = Types.ObjectId;

const MAX_RETRIEVED = 20;

export async function populateDiscoverForUser(userID: ObjectIdType) {
  const numUsers = Math.floor(Math.random() * 4) + 12;
  const numCommunities = MAX_RETRIEVED - numUsers;

  try {
    //getting connection ids for user
    const user = await User.model
      .findById(userID)
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
    const userPromise = User.model
      .aggregate([
        {
          $match: {
            $and: [
              { _id: { $not: { $eq: ObjectIdVal(userID.toString()) } } },
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
            accountType: '$accountType',
            position: '$position',
            graduationYear: '$graduationYear',
            profilePicture: '$profilePicture',
            joinedCommunities: '$joinedCommunities',
            connections: '$connections',
            pendingConnections: '$pendingConnections',
          },
        },
      ])
      .exec();

    //Getting random sample of communities that user has not joined / requested to join
    const communityPromise = Community.model
      .aggregate([
        {
          $match: {
            $and: [
              { members: { $not: { $eq: ObjectIdVal(userID.toString()) } } },
              { pendingMembers: { $not: { $eq: ObjectIdVal(userID.toString()) } } },
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
      ])
      .exec();

    return Promise.all([communityPromise, userPromise])
      .then(async ([communities, users]) => {
        const connectionUserIDs = connectionsToUserIDStrings(
          userID,
          connections as IConnection[]
        );

        //Cleaning users array
        for (let i = 0; i < users.length; i++) {
          users[i].connections = connectionsToUserIDStrings(
            users[i]._id,
            users[i].connections
          );

          const cleanedUser = await addCalculatedUserFields(
            connectionUserIDs,
            joinedCommunities as ObjectIdType[],
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

        const fullInfo = await addCommunityAndUserImages(communities, users);
        return fullInfo;
      })
      .catch((err) => {
        log('error', err);
        return false;
      });
  } catch (err) {
    log('error', err);
    return false;
  }
}

export async function exactMatchSearchFor(
  userID: ObjectIdType,
  query: string,
  limit: number = 20
) {
  const cleanedQuery = query.trim();

  Search.createSearch(userID, query);

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
    const userPromise = User.model
      .find({
        $and: [
          // { _id: { $not: { $eq: mongoose.Types.ObjectId(userID) } } },
          { $or: userSearchConditions },
        ],
      })
      .select(['firstName', 'lastName', 'email', 'profilePicture'])
      .limit(limit)
      .lean()
      .exec();

    const communityPromise = Community.model
      .find({
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

function addCommunityAndUserImages(communities: any[], users: any[]) {
  const communityImagePromises = generateSignedProfilePromises(
    communities,
    'communityProfile'
  );
  const userImagePromises = generateSignedProfilePromises(users, 'profile');

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

async function getCommunityDocuments(
  userID: ObjectIdType,
  communityID: ObjectIdType
) {
  const documents = ((await Community.model
    .findOne({ _id: communityID, members: userID }, ['documents'])
    .populate('documents', 'fileName')
    .lean<ICommunity>()
    .exec()) as {
    documents: IDocument[];
  })?.documents;

  if (!documents) return undefined;

  const adminPromise = Community.model.exists({ _id: communityID, admin: userID });
  const urlsPromise = retrieveAllUrls(
    documents.map((doc) => {
      return {
        _id: doc._id,
        fileType: 'documents',
        reason: 'community',
        fileName: doc.fileName,
        entityID: communityID.toString(),
      };
    })
  );

  return Promise.all([urlsPromise, adminPromise]).then(([documents, isAdmin]) => {
    return { documents, isAdmin };
  });
}

async function getUserDocuments(
  selfUserID: ObjectIdType,
  otherUserID: ObjectIdType
) {
  const checkConnected = await Connection.model.exists({
    $or: [
      { $and: [{ from: selfUserID }, { to: otherUserID }, { accepted: true }] },
      { $and: [{ from: otherUserID }, { to: selfUserID }, { accepted: true }] },
    ],
  });
  if (!checkConnected && !selfUserID.equals(otherUserID)) return undefined;

  const documents = ((await User.model
    .findById(otherUserID, ['documents'])
    .populate('documents', 'fileName')
    .lean<IUser>()
    .exec()) as {
    documents: IDocument[];
  })?.documents;
  if (!documents) return undefined;

  const urlsPromise = retrieveAllUrls(
    documents.map((doc) => {
      return {
        _id: doc._id,
        fileType: 'documents',
        reason: 'user',
        fileName: doc.fileName,
        entityID: otherUserID.toString(),
      };
    })
  );
}

export async function getSidebarData(
  selfUserID: ObjectIdType,
  dataSources: SidebarData[],
  communityID?: ObjectIdType,
  otherUserID?: ObjectIdType
) {
  const promises = [];
  if (dataSources.includes('discoverCommunities' || 'discoverUsers'))
    promises.push(populateDiscoverForUser(selfUserID));

  dataSources.forEach((dataSource) => {
    switch (dataSource) {
      case 'communityDocuments':
        promises.push(getCommunityDocuments(selfUserID, communityID));
        break;
      case 'userDocuments':
        promises.push(getUserDocuments(selfUserID, otherUserID));
        break;
      // case 'pinnedCommunities':
      //   promises.push(getPinnedCommunities(userID));
      //   break;
      // case 'trending':
      //   promises.push(getTrending(userID));
      //   break;
    }
  });

  let output: { [key in SidebarData]?: any } = {};
  return Promise.all(promises).then((data) => {
    let count = 0;
    if (dataSources.includes('discoverCommunities' || 'discoverUsers')) {
      const discoverData = data[count++];
      if (!discoverData) output = { discoverUsers: [], discoverCommunities: [] };
      output.discoverUsers = discoverData['users'];
      output.discoverCommunities = discoverData['communities'];
    }

    for (let i = 0; i < dataSources.length; i++) {
      if (count === data.length) break;
      switch (dataSources[i]) {
        case 'communityDocuments':
          output.communityDocuments = data[count++];
          break;
        case 'userDocuments':
          output.userDocuments = data[count++];
          break;
        case 'pinnedCommunities':
          output.pinnedCommunities = data[count++];
          break;
        case 'trending':
          output.trending = data[count++];
          break;
      }
    }

    return sendPacket(1, 'Retrieved Sidebar data', { ...output });
  });
}
