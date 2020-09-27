const mongoose = require('mongoose');
import { log, sendPacket, retrieveSignedUrl } from '../helpers/functions';

import { User } from '../models';

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

export function extractOtherUserIDFromConnections(
  userID,
  connectionsDBArray: [{ [key: string]: any; from: string; to: string }]
): string[] {
  const connections = connectionsDBArray.reduce((output, connection) => {
    const otherID =
      connection['from'].toString() != userID.toString()
        ? connection['from']
        : connection['to'];

    output.push(otherID.toString());
    return output;
  }, []);
  return connections;
}

// Adds profile picture, mutual members, and mutual communities
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

  let cleanedUser = copyObject(otherUser, [
    'connections',
    'pendingConnections',
    'joinedCommunities',
  ]);

  cleanedUser.profilePicture = profilePicture;
  cleanedUser.numMutualConnections = mutualConnections.length;
  cleanedUser.numMutualCommunities = mutualCommunities.length;
  cleanedUser.status = 'PUBLIC';

  return cleanedUser;
}

// Adds profile picture and mutual members
export async function addCalculatedCommunityFields(
  currentUserConnections: string[],
  community: {
    [key: string]: any;
    _id: string;
    admin: string;
  }
) {
  const currentUserConnectionsStrings = toStringArray(currentUserConnections);
  const membersStrings = toStringArray(community.members);

  const mutualMembers = currentUserConnectionsStrings.filter((connection) => {
    return membersStrings.indexOf(connection) !== -1;
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
    admin: community.admin,
    numMembers: community.members.length,
    numMutual: mutualMembers.length,
    status: 'OPEN',
  };

  return cleanedCommunity;
}

export function getUserToUserRelationship(
  currentUserConnections,
  currentUserPendingConnections,
  originalOtherUser: {
    [key: string]: any;
    _id: string;
    connections: string[];
    pendingConnections: string[];
    joinedCommunities: string[];
  },
  cleanedOtherUser: {
    [key: string]: any;
    _id: string;
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
    cleanedCommunity.status = 'JOINED';
  else if (currentUserPendingCommunities.indexOf(originalCommunity._id) !== -1)
    cleanedCommunity.status = 'PENDING';
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

export function connectionsToUserIDStrings(userID, connections) {
  return connections.reduce((output, connection) => {
    if (connection.accepted) {
      const otherID =
        connection['from'].toString() != userID.toString()
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
        connection['from'].toString() != userID.toString()
          ? connection['from']
          : connection['to'];

      output.push(mongoose.Types.ObjectId(otherID));
    }
    return output;
  }, []);
}

export function toStringArray(array) {
  let retArray = [];
  array.forEach((element) => {
    retArray.push(element.toString());
  });

  return retArray;
}
