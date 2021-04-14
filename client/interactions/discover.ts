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

import { U2UR } from '../rootshare_db/types';

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
  Search.createSearch(userID, query);

  const usersPromise = userSearch({ query, limit });
  const communitiesPromise = communitySearch({ query, limit });

  const [users, communities] = await Promise.all([usersPromise, communitiesPromise]);

  if (users && communities)
    return sendPacket(1, 'Successfully searched', { users, communities });
  return sendPacket(-1, 'There was an error searching');
}

export const communityInviteSearch = async ({
  query,
  limit,
  communityID,
  userID,
}: {
  query: string;
  communityID: string;
  userID: string;
  limit?: number;
}) => {
  const additionalFilter = {
    $and: [
      {
        joinedCommunities: {
          $not: { $elemMatch: { $eq: ObjectIdVal(communityID) } },
        },
      },
      {
        pendingCommunities: {
          $not: { $elemMatch: { $eq: ObjectIdVal(communityID) } },
        },
      },
    ],
  };
  let users = await userSearch({
    query,
    limit,
    additionalFilter,
    getRelationship: { toUserID: userID },
  });
  if (!users) return sendPacket(-1, 'Failed to get users');

  const valuedRelationship = {
    [U2UR.SELF]: -1,
    [U2UR.CONNECTED]: 0,
    [U2UR.PENDING_FROM]: 1,
    [U2UR.PENDING_TO]: 2,
    [U2UR.PENDING]: 3,
    [U2UR.OPEN]: 4,
  };

  users.sort((a, b) => {
    if (
      valuedRelationship[a.relationship] === 0 &&
      valuedRelationship[b.relationship] === 0
    )
      return 0;
    else if (valuedRelationship[a.relationship] < valuedRelationship[b.relationship])
      return -1;
    return 1;
  });
  return sendPacket(1, 'Retrieved users', { users });
};

export const userSearch = async ({
  query,
  limit,
  additionalFilter,
  getRelationship,
}: {
  query: string;
  limit?: number;
  additionalFilter?: { [k: string]: unknown };
  getRelationship?: { toUserID: string };
}): Promise<
  | {
      firstName: string;
      lastName: string;
      email: string;
      profilePicture?: string;
      relationship:
        | typeof U2UR.SELF
        | typeof U2UR.CONNECTED
        | typeof U2UR.PENDING_FROM
        | typeof U2UR.PENDING_TO
        | typeof U2UR.PENDING
        | typeof U2UR.OPEN;
    }[]
  | false
> => {
  const defaultLimit = 20;
  const cleanedQuery = query.trim();

  const terms = cleanedQuery.split(' ');
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
      return false;
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
      return false;
    }
  }

  try {
    const andCondition: { [k: string]: unknown }[] = [{ $or: userSearchConditions }];
    if (additionalFilter) andCondition.push(additionalFilter);

    const selectFields = ['firstName', 'lastName', 'email', 'profilePicture'];
    if (getRelationship) selectFields.push('connections', 'pendingConnections');

    const usersPromise = User.model
      .find({
        $and: andCondition,
      })
      .select(selectFields)
      .limit(limit || defaultLimit);

    if (getRelationship)
      usersPromise.populate({ path: 'pendingConnections', select: 'from to' });

    const users = await usersPromise.lean<IUser[]>().exec();

    if (getRelationship) {
      await User.getUserToUserRelationship_V2(
        ObjectIdVal(getRelationship.toUserID),
        users as {
          [key: string]: any;
          _id: ObjectIdType;
          pendingConnections: IConnection[];
          connections: ObjectIdType[];
        }[]
      );
      users.forEach((user) => {
        delete user['connections'];
        delete user['pendingConnections'];
      });
    }

    const images = await Promise.all(
      generateSignedProfilePromises(users, 'profile')
    );

    for (let i = 0; i < users.length; i++)
      if (images[i]) users[i].profilePicture = images[i] as string;

    return (users as unknown) as {
      firstName: string;
      lastName: string;
      email: string;
      profilePicture?: string;
      relationship:
        | typeof U2UR.SELF
        | typeof U2UR.CONNECTED
        | typeof U2UR.PENDING_FROM
        | typeof U2UR.PENDING_TO
        | typeof U2UR.PENDING
        | typeof U2UR.OPEN;
    }[];
  } catch (err) {
    log('error', err);
    return false;
  }
};

export const communitySearch = async ({
  query,
  limit,
  additionalFilter,
}: {
  query: string;
  limit?: number;
  additionalFilter?: { [k: string]: unknown };
}) => {
  const defaultLimit = 20;
  const cleanedQuery = query.trim();

  try {
    const searchConditions: { [k: string]: unknown }[] = [
      {
        name: new RegExp(cleanedQuery, 'gi'),
      },
    ];
    if (additionalFilter) searchConditions.push(additionalFilter);

    const communities = await Community.model
      .find({ $and: searchConditions })
      .select([
        'name',
        'type',
        'description',
        'private',
        'profilePicture',
        'university',
      ])
      .limit(limit || defaultLimit)
      .lean()
      .exec();

    const images = await Promise.all(
      generateSignedProfilePromises(communities, 'communityProfile')
    );

    for (let i = 0; i < communities.length; i++)
      if (images[i]) communities[i].profilePicture = images[i] as string;

    return communities;
  } catch (err) {
    log('error', err);
    return false;
  }
};

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
