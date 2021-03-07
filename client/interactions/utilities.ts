const mongoose = require('mongoose');
import { log, sendPacket, retrieveSignedUrl } from '../helpers/functions';

import { User } from '../models';
import { U2UR, U2CR } from '../helpers/types';

export function getUserData(callback) {
  User.find(
    {},
    [
      'firstName',
      'lastName',
      'createdAt',
      'accountType',
      'email',
      'phoneNumber',
      'graduationYear',
      'major',
      'work',
      'position',
      'department',
      'graduateSchool',
    ],
    (err, users) => {
      if (err || users === undefined || users === null) {
        return callback(sendPacket(-1, 'Could not find users'));
      }

      const { studentCount, alumniCount, facultyCount, fanCount } = countAccountType(
        users
      );
      return callback(
        sendPacket(1, 'Found users', {
          users,
          studentCount,
          alumniCount,
          facultyCount,
          fanCount,
        })
      );
    }
  );
}

function countAccountType(users) {
  const accountTypes = ['student', 'alumni', 'faculty', 'fan'];
  let accountCounts = [0, 0, 0, 0];
  const numTypes = accountTypes.length;

  for (let i = 0; i < users.length; i++) {
    const userAccountType = users[i].accountType;
    for (let j = 0; j < numTypes; j++) {
      const checkAccountType = accountTypes[j];
      if (checkAccountType.localeCompare(userAccountType) === 0) {
        accountCounts[j]++;
      }
    }
  }

  const retCounts = {
    studentCount: 0,
    alumniCount: 0,
    facultyCount: 0,
    fanCount: 0,
  };

  for (let i = 0; i < numTypes; i++) {
    retCounts[`${accountTypes[i]}Count`] = accountCounts[i];
  }

  return retCounts;
}

// Adds mutual members, and mutual communities
export async function addCalculatedUserFields(
  currentUserConnections: string[],
  currentUserJoinedCommunities: string[],
  otherUser: {
    [key: string]: any;
    _id: string;
    profilePicture?: string;
    connections: string[];
    joinedCommunities: string[];
    status: string;
  }
) {
  const userConnectionsStrings = toStringArray(currentUserConnections);
  const userCommunitiesStrings = toStringArray(currentUserJoinedCommunities);
  const otherUserConnectionsStrings = toStringArray(otherUser.connections);
  const otherUserCommunitiesStrings = toStringArray(otherUser.joinedCommunities);

  //Calculating mutual connections and communities
  const mutualConnections = userConnectionsStrings.filter((connection) => {
    return otherUserConnectionsStrings.indexOf(connection) !== -1;
  });
  const mutualCommunities = userCommunitiesStrings.filter((community) => {
    return otherUserCommunitiesStrings.indexOf(community) !== -1;
  });

  let cleanedUser = copyObject(otherUser, [
    'connections',
    'connectionUserIDs',
    'pendingConnections',
    'joinedCommunities',
  ]);

  cleanedUser.numMutualConnections = mutualConnections.length;
  cleanedUser.numMutualCommunities = mutualCommunities.length;
  cleanedUser.status = U2UR.OPEN;

  return cleanedUser;
}

// Adds profile picture and mutual members
export async function addCalculatedCommunityFields(
  currentUserConnections: string[],
  community: {
    [key: string]: any;
    _id: string;
    admin: string;
    members: string[];
  }
) {
  const currentUserConnectionsStrings = toStringArray(currentUserConnections);
  const membersStrings = toStringArray(community.members);

  const mutualMembers = currentUserConnectionsStrings.filter((connection) => {
    return membersStrings.indexOf(connection) !== -1;
  });

  const cleanedCommunity = copyObject(community, ['members']);
  cleanedCommunity.numMembers = community.members.length;
  cleanedCommunity.numMutual = mutualMembers.length;
  cleanedCommunity.status = U2UR.OPEN;

  return cleanedCommunity;
}

export function getUserToUserRelationship(
  currentUserConnections,
  currentUserPendingConnections,
  originalOtherUser: {
    [key: string]: any;
    _id: string;
    connections: any[];
    pendingConnections: string[];
    joinedCommunities: string[];
  },
  cleanedOtherUser: {
    [key: string]: any;
    _id: string;
    status: string;
  }
) {
  const otherUserPendingStrings = toStringArray(
    originalOtherUser.pendingConnections
  );

  for (let i = 0; i < currentUserConnections.length; i++)
    for (let j = 0; j < originalOtherUser.connections.length; j++)
      if (
        currentUserConnections[i]._id.toString() ===
        originalOtherUser.connections[j]._id.toString()
      )
        return (cleanedOtherUser.status = U2UR.CONNECTED);

  for (let i = 0; i < currentUserPendingConnections.length; i++)
    if (
      otherUserPendingStrings.indexOf(
        currentUserPendingConnections[i]._id.toString()
      ) !== -1
    )
      if (
        currentUserPendingConnections[i].from.toString() ===
        cleanedOtherUser._id.toString()
      ) {
        cleanedOtherUser.status = U2UR.PENDING_FROM;
        cleanedOtherUser.connectionRequestID = currentUserPendingConnections[i]._id;
      } else cleanedOtherUser.status = U2UR.PENDING_TO;
}

export function getUserToCommunityRelationship(
  currentUserJoinedCommunities: string[],
  currentUserPendingCommunities: string[],
  originalCommunity: {
    [key: string]: any;
    _id: string;
  },
  cleanedCommunity: {
    [key: string]: any;
    status: string;
  }
) {
  if (currentUserJoinedCommunities.indexOf(originalCommunity._id) !== -1)
    cleanedCommunity.status = U2CR.JOINED;
  else if (currentUserPendingCommunities.indexOf(originalCommunity._id) !== -1)
    cleanedCommunity.status = U2CR.PENDING;
}

function copyObject(oldObject, exclusions) {
  const keys = Object.keys(oldObject);
  let newObject: any = {};
  keys.forEach((key) => {
    if (exclusions.indexOf(key) === -1) newObject[key] = oldObject[key];
  });

  return newObject;
}

export async function addProfilePictureToUser(user) {
  //Getting profile picture
  let profilePicture = undefined;
  if (user.profilePicture) {
    try {
      const signedImageURL = await retrieveSignedUrl('profile', user.profilePicture);
      if (signedImageURL) profilePicture = signedImageURL;
    } catch (err) {
      log('error', err);
    }
  }

  user.profilePicture = profilePicture;
}

export function generateSignedImagePromises(
  entityList: {
    [key: string]: any;
    profilePicture?: string;
  },
  imageType: 'profile' | 'communityProfile'
) {
  const profilePicturePromises = [];

  for (let i = 0; i < entityList.length; i++) {
    if (entityList[i].profilePicture) {
      try {
        const signedImageURLPromise = retrieveSignedUrl(
          imageType,
          entityList[i].profilePicture
        );
        profilePicturePromises.push(signedImageURLPromise);
      } catch (err) {
        profilePicturePromises.push(null);
        log('error', 'There was an error retrieving a signed url from S3');
      }
    } else {
      profilePicturePromises.push(null);
    }
  }

  return profilePicturePromises;
}

export function addProfilePicturesAll(
  entities,
  imageReason: 'profile' | 'communityProfile'
) {
  const imagePromises = generateSignedImagePromises(entities, imageReason);

  return Promise.all(imagePromises)
    .then((signedImageURLs) => {
      for (let i = 0; i < signedImageURLs.length; i++) {
        if (signedImageURLs[i]) entities[i].profilePicture = signedImageURLs[i];
        else entities[i].profilePicture = undefined;
      }

      return entities;
    })
    .catch((err) => {
      log('error', err);
      for (let i = 0; i < entities.length; i++) {
        const imageURL = entities[i].profilePicture;
        if (
          !imageURL ||
          typeof imageURL !== 'string' ||
          imageURL.length < 4 ||
          imageURL.substring(0, 4) !== 'http'
        )
          entities[i].profilePicture = undefined;
      }
      return entities;
    });
}

export function addProfilePicturesToRequests(requests) {
  const profilePicturePromises = [];
  for (let i = 0; i < requests.length; i++) {
    if (requests[i].from.profilePicture) {
      const signedImageURLPromise = retrieveSignedUrl(
        'profile',
        requests[i].from.profilePicture
      );
      profilePicturePromises.push(signedImageURLPromise);
    } else {
      profilePicturePromises.push(null);
    }
  }

  return Promise.all(profilePicturePromises)
    .then((signedImageURLs) => {
      for (let i = 0; i < signedImageURLs.length; i++) {
        if (signedImageURLs[i]) requests[i].from.profilePicture = signedImageURLs[i];
        else requests[i].from.profilePicture = undefined;
      }

      return requests;
    })
    .catch((err) => {
      log('error', err);
      for (let i = 0; i < requests.length; i++) {
        const imageURL = requests[i].from.profilePicture;
        if (
          !imageURL ||
          typeof imageURL !== 'string' ||
          imageURL.length < 4 ||
          imageURL.substring(0, 4) !== 'http'
        )
          requests[i].from.profilePicture = undefined;
      }
      return requests;
    });
}

export function connectionsToUserIDStrings(userID, connections) {
  return connections.reduce((output, connection) => {
    if (connection.accepted) {
      const otherID =
        connection['from'].toString() !== userID.toString()
          ? connection['from']
          : connection['to'];

      output.push(otherID.toString());
    }
    return output;
  }, []);
}

export function connectionsToUserIDs(userID, connections) {
  return connections.reduce((output, connection) => {
    if (connection.accepted) {
      const otherID =
        connection['from'].toString() !== userID.toString()
          ? connection['from']
          : connection['to'];

      output.push(mongoose.Types.ObjectId(otherID));
    }
    return output;
  }, []);
}

export function pendingToUserIDs(userID, connections) {
  return connections.reduce((output, connection) => {
    if (!connection.accepted) {
      const otherID =
        connection['from'].toString() !== userID.toString()
          ? connection['from']
          : connection['to'];

      output.push(mongoose.Types.ObjectId(otherID));
    }
    return output;
  }, []);
}

export function toStringArray(array) {
  if (!array)
    log('ERROR', 'Array is undefined and cannot be converted to string array');
  let retArray = [];
  array.forEach((element) => {
    retArray.push(element.toString());
  });

  return retArray;
}
