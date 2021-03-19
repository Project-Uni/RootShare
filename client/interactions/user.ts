import { Types } from 'mongoose';

import {
  User,
  Connection,
  Webinar,
  IConnection,
  ICommunity,
} from '../rootshare_db/models';
import { GetUsersByIDsOptions } from '../rootshare_db/models/users';
import { U2UR, U2CR, packetParams } from '../rootshare_db/types';
import { log, sendPacket, retrieveSignedUrl } from '../helpers/functions';
import {
  addCalculatedUserFields,
  getUserToUserRelationship,
  addCalculatedCommunityFields,
  getUserToCommunityRelationship,
  connectionsToUserIDStrings,
  connectionsToUserIDs,
  pendingToUserIDs,
  addProfilePicturesAll,
  addProfilePicturesToRequests,
} from './utilities';

const ObjectIdVal = Types.ObjectId;
type ObjectIdType = Types.ObjectId;

export async function getCurrentUser(
  user: any,
  callback: (packet: packetParams) => void
) {
  if (Object.keys(user).some((key) => !user[key]))
    return callback(sendPacket(0, 'User not found'));

  return callback(
    sendPacket(1, 'Found current User', {
      email: user.email,
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      privilegeLevel: user.privilegeLevel || 1,
      accountType: user.accountType,
    })
  );
}

export async function getPrivateProfileInformation(
  userID: ObjectIdType,
  callback: (packet: packetParams) => void
) {
  User.model
    .aggregate([
      { $match: { _id: ObjectIdVal(userID.toString()) } },
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
          email: '$email',
          firstName: '$firstName',
          lastName: '$lastName',
          major: '$major',
          graduationYear: '$graduationYear',
          work: '$work',
          position: '$position',
          department: '$department',
          interests: '$interests',
          organizations: '$organizations',
          graduateSchool: '$graduateSchool',
          bio: '$bio',
          phoneNumber: '$phoneNumber',
          discoveryMethod: '$discoveryMethod',
          numConnections: { $size: '$connections' },
          numCommunities: { $size: '$joinedCommunities' },
          university: {
            _id: '$university._id',
            universityName: '$university.universityName',
          },
        },
      },
    ])
    .then((users) => {
      if (!users || users.length === 0)
        return callback(sendPacket(0, "Couldn't find user"));
      return callback(
        sendPacket(1, 'Sending personal user information', { user: users[0] })
      );
    })
    .catch((err) => {
      log('err', err);
      callback(sendPacket(-1, err));
    });
}

export async function getPublicProfileInformation(
  selfUserID: ObjectIdType,
  userID: ObjectIdType,
  callback: (packet: packetParams) => void
) {
  try {
    const selfUserPromise = User.model
      .findById(selfUserID, ['connections', 'joinedCommunities'])
      .populate({ path: 'connections', select: ['accepted', 'from', 'to'] })
      .exec();

    const otherUserPromise = User.model
      .aggregate([
        { $match: { _id: ObjectIdVal(userID.toString()) } },
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
            email: '$email',
            firstName: '$firstName',
            lastName: '$lastName',
            major: '$major',
            graduationYear: '$graduationYear',
            work: '$work',
            position: '$position',
            department: '$department',
            interests: '$interests',
            organizations: '$organizations',
            graduateSchool: '$graduateSchool',
            bio: '$bio',
            connections: '$connections',
            joinedCommunities: '$joinedCommunities',
            numConnections: { $size: '$connections' },
            numCommunities: { $size: '$joinedCommunities' },
            university: {
              _id: '$university._id',
              universityName: '$university.universityName',
            },
          },
        },
      ])
      .exec();

    Promise.all([selfUserPromise, otherUserPromise]).then(
      async ([selfUser, otherUserOutput]) => {
        if (!selfUser || !otherUserOutput || otherUserOutput.length === 0)
          return callback(sendPacket(0, 'Could not find the given user'));

        let otherUser = otherUserOutput[0];
        const selfConnections = connectionsToUserIDStrings(
          selfUserID,
          selfUser.connections as IConnection[]
        );

        otherUser.connections = connectionsToUserIDStrings(
          otherUser._id,
          otherUser.connections
        );

        otherUser = await addCalculatedUserFields(
          selfConnections,
          selfUser.joinedCommunities as ObjectIdType[],
          otherUser
        );

        return callback(
          sendPacket(1, 'Sending public user information', { user: otherUser })
        );
      }
    );
  } catch (err) {
    log('err', err);
    return callback(sendPacket(-1, err));
  }
}

export function getUserEvents(
  userID: ObjectIdType,
  callback: (packet: packetParams) => void
) {
  User.model
    .aggregate([
      { $match: { _id: ObjectIdVal(userID.toString()) } },
      {
        $lookup: {
          from: 'webinars',
          let: { attended: '$attendedWebinars', rsvps: '$RSVPWebinars' },
          pipeline: [
            {
              $match: {
                $and: [
                  {
                    $or: [
                      { $expr: { $in: ['$_id', '$$rsvps'] } },
                      { $expr: { $in: ['$_id', '$$attended'] } },
                    ],
                  },
                  { isDev: { $ne: true } },
                ],
              },
            },
            { $sort: { dateTime: 1 } },
            {
              $lookup: {
                from: 'users',
                localField: 'host',
                foreignField: '_id',
                as: 'host',
              },
            },
            { $unwind: '$host' },
            {
              $project: {
                _id: '$_id',
                title: '$title',
                brief_description: '$brief_description',
                full_description: '$full_description',
                dateTime: '$dateTime',
                userSpeaker: { $in: [userID, '$speakers'] },
                host: {
                  _id: '$host._id',
                  firstName: '$host.firstName',
                  lastName: '$host.lastName',
                },
              },
            },
          ],
          as: 'RSVPWebinars',
        },
      },
      {
        $project: {
          RSVPWebinars: '$RSVPWebinars',
        },
      },
    ])
    .exec()
    .then((users) => {
      if (!users || users.length === 0)
        return callback(sendPacket(0, "Could not find User's Events"));
      return callback(
        sendPacket(1, "Sending User's Events", { events: users[0].RSVPWebinars })
      );
    })
    .catch((err) => callback(sendPacket(-1, err)));
}

export function updateProfileInformation(
  userID: ObjectIdType,
  profileData: any,
  callback: (packet: packetParams) => void
) {
  User.model.findById(
    userID,
    [
      'firstName',
      'lastName',
      'major',
      'graduationYear',
      'work',
      'position',
      'university',
      'department',
      'interests',
      'organizations',
      'graduateSchool',
      'phoneNumber',
      'discoveryMethod',
    ],
    {},
    (err, user) => {
      if (err) return callback(sendPacket(-1, err.message));
      if (!user) return callback(sendPacket(0, 'Could not find user'));

      if (profileData['firstName']) user.firstName = profileData['firstName'];
      if (profileData['lastName']) user.lastName = profileData['lastName'];
      if (profileData['major']) user.major = profileData['major'];
      if (profileData['graduationYear'])
        user.graduationYear = profileData['graduationYear'];
      if (profileData['work']) user.work = profileData['work'];
      if (profileData['position']) user.position = profileData['position'];
      if (profileData['university']) user.university = profileData['university'];
      if (profileData['department']) user.department = profileData['department'];
      if (profileData['interests']) user.interests = profileData['interests'];
      if (profileData['organizations'])
        user.organizations = profileData['organizations'];
      if (profileData['graduateSchool'])
        user.graduateSchool = profileData['graduateSchool'];
      if (profileData['phoneNumber']) user.phoneNumber = profileData['phoneNumber'];
      if (profileData['discoveryMethod'])
        user.discoveryMethod = profileData['discoveryMethod'];
      user.save((err) => {
        if (err) return callback(sendPacket(-1, err.message));
        return callback(sendPacket(1, 'Successfully updated user profile!'));
      });
    }
  );
}

export function updateUserBio(
  userID: ObjectIdType,
  newBio: string,
  callback: (packet: packetParams) => void
) {
  User.model.updateOne({ _id: userID }, { bio: newBio }, {}, (err, update) => {
    if (err) return callback(sendPacket(-1, err));
    if (update.n === 0) return callback(sendPacket(0, 'Could not find User'));
    return callback(sendPacket(1, "Updated user's bio"));
  });
}

// TODO: either send these in chunks or store all connections in redux when user logs in
export function getConnections(
  userID: ObjectIdType,
  callback: (packet: packetParams) => void
) {
  const lookupConnections = {
    $lookup: {
      from: 'connections',
      localField: 'connections',
      foreignField: '_id',
      as: 'connections',
    },
  };
  const transformToArray = {
    $project: {
      connections: ['$connections.from', '$connections.to'],
    },
  };
  const squashToSingleArray = {
    $project: {
      connections: {
        $reduce: {
          input: '$connections',
          initialValue: [],
          in: { $concatArrays: ['$$value', '$$this'] },
        },
      },
    },
  };
  const removeSelf = {
    $project: {
      connections: {
        $filter: {
          input: '$connections',
          as: 'connection',
          cond: {
            $ne: ['$$connection', ObjectIdVal(userID.toString())],
          },
        },
      },
    },
  };
  const lookupConnectionUsers = {
    $lookup: {
      from: 'users',
      let: { connections: '$connections' },
      pipeline: [
        { $match: { $expr: { $in: ['$_id', '$$connections'] } } },
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
            _id: '$_id',
            firstName: '$firstName',
            lastName: '$lastName',
            accountType: '$accountType',
            profilePicture: '$profilePicture',
            university: {
              _id: '$university._id',
              universityName: '$university.universityName',
              nickname: '$university.nickname',
            },
          },
        },
      ],
      as: 'connections',
    },
  };
  User.model
    .aggregate([
      { $match: { _id: ObjectIdVal(userID.toString()) } },
      lookupConnections,
      transformToArray,
      squashToSingleArray,
      removeSelf,
      lookupConnectionUsers,
    ])
    .exec()
    .then(async (user) => {
      if (!user || user.length === 0)
        return callback(sendPacket(-1, 'Could not find connections'));

      const connections = await addProfilePicturesAll(
        user[0].connections,
        'profile'
      );

      return callback(sendPacket(1, `Sending User's Connections`, { connections }));
    })
    .catch((err) => {
      if (err) return callback(sendPacket(-1, err));
    });
}

export function getConnectionSuggestions(
  userID: ObjectIdType,
  callback: (packet: packetParams) => void
) {
  User.model
    .aggregate([
      { $sample: { size: 15 } },
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
          _id: '$_id',
          firstName: '$firstName',
          lastName: '$lastName',
          accountType: '$accountType',
          connections: '$connections',
          joinedCommunities: '$joinedCommunities',
          profilePicture: '$profilePicture',
          university: {
            _id: '$university._id',
            universityName: '$university.universityName',
            nickname: '$university.nickname',
          },
        },
      },
    ])
    .exec()
    .then((rawSuggestions) => {
      if (!rawSuggestions)
        return callback(sendPacket(-1, "Couldn't get suggestions"));
      User.model
        .aggregate([
          { $match: { _id: ObjectIdVal(userID.toString()) } },
          {
            $lookup: {
              from: 'connections',
              localField: 'connections',
              foreignField: '_id',
              as: 'connections',
            },
          },
          {
            $lookup: {
              from: 'connections',
              localField: 'pendingConnections',
              foreignField: '_id',
              as: 'pendingConnections',
            },
          },
          {
            $project: {
              _id: '$_id',
              connections: '$connections',
              pendingConnections: '$pendingConnections',
              joinedCommunities: '$joinedCommunities',
            },
          },
        ])
        .exec()
        .then(async (user) => {
          if (!user || user.length === 0)
            return callback(sendPacket(-1, "Couldn't get User"));
          let suggestions = filterSuggestions(user[0], rawSuggestions);
          for (let i = 0; i < suggestions.length; i++) {
            const cleanedSuggestion = await addCalculatedUserFields(
              user[0].connections,
              user[0].joinedCommunities,
              suggestions[i]
            );

            suggestions[i] = cleanedSuggestion;
          }

          suggestions = await addProfilePicturesAll(suggestions, 'profile');
          return callback(
            sendPacket(1, 'Sending Connection Suggestions', { suggestions })
          );
        });
    })
    .catch((err) => {
      if (err) callback(sendPacket(-1, err));
    });
}

// Removes suggestions that are already pending or connected
function filterSuggestions(user: any, suggestions: any[]) {
  let excludedUsers = new Set();
  excludedUsers.add(user._id.toString());
  user.connections.forEach((connection) => {
    excludedUsers.add(connection.from.toString());
    excludedUsers.add(connection.to.toString());
  });
  user.pendingConnections.forEach((pendingConnection) => {
    excludedUsers.add(pendingConnection.from.toString());
    excludedUsers.add(pendingConnection.to.toString());
  });

  return suggestions.filter(
    (suggestion) => !excludedUsers.has(suggestion._id.toString())
  );
}

export function getPendingRequests(
  userID: ObjectIdType,
  callback: (packet: packetParams) => void
) {
  User.model
    .aggregate([
      { $match: { _id: ObjectIdVal(userID.toString()) } },
      {
        $lookup: {
          from: 'connections',
          let: { pendingConnections: '$pendingConnections' },
          pipeline: [
            { $match: { $expr: { $in: ['$_id', '$$pendingConnections'] } } },
            {
              $lookup: {
                from: 'users',
                let: { from: '$from' },
                pipeline: [
                  { $match: { $expr: { $eq: ['$_id', '$$from'] } } },
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
                      _id: '$_id',
                      firstName: '$firstName',
                      lastName: '$lastName',
                      accountType: '$accountType',
                      connections: '$connections',
                      joinedCommunities: '$joinedCommunities',
                      profilePicture: '$profilePicture',
                      university: {
                        _id: '$university._id',
                        universityName: '$university.universityName',
                        nickname: '$university.nickname',
                      },
                    },
                  },
                ],
                as: 'from',
              },
            },
            { $unwind: '$from' },
            {
              $project: {
                _id: '$_id',
                from: '$from',
                to: '$to',
                accepted: '$accepted',
                createdAt: '$createdAt',
              },
            },
          ],
          as: 'pendingConnections',
        },
      },
      {
        $project: {
          connections: '$connections',
          joinedCommunities: '$joinedCommunities',
          pendingConnections: {
            $filter: {
              input: '$pendingConnections',
              as: 'pendingConnection',
              cond: {
                $and: [
                  {
                    $eq: ['$$pendingConnection.to', ObjectIdVal(userID.toString())],
                  },
                  {
                    $eq: ['$$pendingConnection.accepted', false],
                  },
                ],
              },
            },
          },
        },
      },
    ])
    .exec()
    .then(async (user) => {
      if (!user || user.length === 0)
        return callback(sendPacket(0, 'Could not get user'));

      let pendingRequests = user[0].pendingConnections;
      for (let i = 0; i < pendingRequests.length; i++) {
        const cleanedUser = await addCalculatedUserFields(
          user[0].connections,
          user[0].joinedCommunities,
          pendingRequests[i].from
        );
        pendingRequests[i].from = cleanedUser;
      }

      pendingRequests = await addProfilePicturesToRequests(pendingRequests);
      if (pendingRequests !== -1)
        return callback(
          sendPacket(1, 'Sending pending requests', { pendingRequests })
        );
    })
    .catch((err) => {
      if (err) callback(sendPacket(-1, err));
    });
}

export async function requestConnection(
  userID: ObjectIdType,
  requestUserID: ObjectIdType
) {
  try {
    const connectionPromise = Connection.getConnectionStatuses(userID, [
      requestUserID,
    ]);
    const userPromise = User.model.exists({ _id: requestUserID });

    return Promise.all([connectionPromise, userPromise]).then(
      async ([connection, userExists]) => {
        const { status } = connection[0];
        if (status === U2UR.CONNECTED) return sendPacket(0, 'Already connected');
        if (status === U2UR.PENDING_TO) return sendPacket(0, 'Already Requested');
        if (status === U2UR.PENDING_FROM)
          return acceptConnectionRequest(connection[0]);

        const newConnectionRequest = await Connection.create({
          from: userID,
          to: requestUserID,
        });
        if (!newConnectionRequest)
          return sendPacket(-1, 'There was an error creating the request');

        const userFromPromise = User.model.updateOne(
          { _id: userID },
          { $addToSet: { pendingConnections: newConnectionRequest._id } }
        );

        const userToPromise = User.model.updateOne(
          { _id: requestUserID },
          { $addToSet: { pendingConnections: newConnectionRequest._id } }
        );

        return Promise.all([userFromPromise, userToPromise]).then(
          ([userFrom, userTo]) => {
            log('info', 'Sent connection request');
            return sendPacket(1, 'Connection request has been sent!', {
              requestID: newConnectionRequest._id,
            });
          }
        );
      }
    );
  } catch (err) {
    log('error', err);
    return sendPacket(-1, err);
  }
}

export async function respondConnection(
  selfUserID: ObjectIdType,
  otherUserID: ObjectIdType,
  accepted: boolean
) {
  try {
    const request = await Connection.model.findOne({
      $or: [
        { $and: [{ from: selfUserID }, { to: otherUserID }] },
        { $and: [{ from: otherUserID }, { to: selfUserID }] },
      ],
    });
    if (!request) return sendPacket(0, 'Could not find Connection Request');

    const isRequestee = selfUserID === request.to;
    const isRequester = selfUserID === request.from;
    if (!accepted && (isRequestee || isRequester))
      return removeConnectionRequest(request);
    if (accepted && isRequestee) return acceptConnectionRequest(request);
    return sendPacket(0, 'Cannot process request');
  } catch (err) {
    log('error', err);
    return sendPacket(-1, err);
  }
}

async function acceptConnectionRequest(request) {
  try {
    const userOneID = request['from'];
    const userTwoID = request['to'];

    const userOneExistsPromise = User.model.exists({ _id: userOneID });
    const userTwoExistsPromise = User.model.exists({ _id: userTwoID });
    return Promise.all([userOneExistsPromise, userTwoExistsPromise]).then(
      ([userOneExists, userTwoExists]) => {
        if (!userOneExists || !userTwoExists)
          return sendPacket(0, 'Could not find Users to connect');

        const userOneUpdate = User.model
          .updateOne(
            { _id: userOneID },
            {
              $addToSet: { connections: request._id },
              $pull: { pendingConnections: request._id },
            }
          )
          .exec();
        const userTwoUpdate = User.model
          .updateOne(
            { _id: userTwoID },
            {
              $addToSet: { connections: request._id },
              $pull: { pendingConnections: request._id },
            }
          )
          .exec();
        const connectionPromise = Connection.update(request._id, { accepted: true });

        return Promise.all([userOneUpdate, userTwoUpdate, connectionPromise]).then(
          ([userOne, userTwo, connection]) => {
            log('info', `Accepted connection ${request._id}`);
            return sendPacket(1, 'Connection Accepted!');
          }
        );
      }
    );
  } catch (err) {
    log('error', err);
    return sendPacket(-1, err);
  }
}

function removeConnectionRequest(request) {
  try {
    const userOneID = request['from'];
    const userTwoID = request['to'];

    const userOneExistsPromise = User.model.exists({ _id: userOneID });
    const userTwoExistsPromise = User.model.exists({ _id: userTwoID });
    return Promise.all([userOneExistsPromise, userTwoExistsPromise]).then(
      ([userOneExists, userTwoExists]) => {
        if (!userOneExists || !userTwoExists)
          return sendPacket(0, 'Could not find Users to connect');

        const userOneUpdate = User.model
          .updateOne(
            { _id: userOneID },
            { $pull: { connections: request._id, pendingConnections: request._id } }
          )
          .exec();
        const userTwoUpdate = User.model
          .updateOne(
            { _id: userTwoID },
            { $pull: { connections: request._id, pendingConnections: request._id } }
          )
          .exec();
        const connectionPromise = Connection.model.deleteOne({ _id: request._id });

        return Promise.all([userOneUpdate, userTwoUpdate, connectionPromise]).then(
          ([userOne, userTwo, connection]) => {
            log('info', `Removed connection ${request._id}`);
            return sendPacket(1, 'Connection Removed!');
          }
        );
      }
    );
  } catch (err) {
    log('error', err);
    return sendPacket(-1, err);
  }
}

export function checkConnectedWithUser(
  userID,
  requestUserID,
  callback: (packet: packetParams) => void
) {
  try {
    userID = userID.toString();
    requestUserID = requestUserID.toString();
    if (requestUserID.localeCompare(userID) === 0)
      return callback(
        sendPacket(1, "Can't be connected to yourself", {
          connected: U2UR.SELF,
        })
      );

    Connection.model.findOne(
      {
        $or: [
          { $and: [{ from: userID }, { to: requestUserID }] },
          { $and: [{ from: requestUserID }, { to: userID }] },
        ],
      },
      (err, connection) => {
        if (err) return callback(sendPacket(-1, err));
        if (!connection)
          return callback(
            sendPacket(1, 'Not yet connected to this user', { connected: U2UR.OPEN })
          );

        if (connection.accepted)
          return callback(
            sendPacket(1, 'Already connected to this User', {
              connected: U2UR.CONNECTED,
            })
          );
        else if (connection.from.toString() === requestUserID)
          return callback(
            sendPacket(1, 'This User has already sent you a request', {
              connected: U2UR.PENDING_FROM,
            })
          );
        else if (connection.to.toString() === requestUserID)
          return callback(
            sendPacket(1, 'Request has already been sent to this User', {
              connected: U2UR.PENDING_TO,
            })
          );
        else return callback(sendPacket(-1, 'An error has occured'));
      }
    );
  } catch (err) {
    return callback(sendPacket(-1, err));
  }
}

export function getConnectionWithUser(
  userID,
  requestUserID,
  callback: (packet: packetParams) => void
) {
  userID = userID.toString();
  requestUserID = requestUserID.toString();
  if (requestUserID.localeCompare(userID) === 0)
    return callback(sendPacket(0, "Can't be connected to yourself"));

  Connection.model.find(
    {
      $or: [
        { $and: [{ from: userID }, { to: requestUserID }] },
        { $and: [{ from: requestUserID }, { to: userID }] },
      ],
    },
    (err, connections) => {
      if (err) return callback(sendPacket(-1, err));
      if (!connections)
        return callback(sendPacket(0, 'Not yet connected to this User'));

      return callback(
        sendPacket(1, 'Sending Connection with User', { connection: connections[0] })
      );
    }
  );
}

export async function updateAttendingList(
  userID: ObjectIdType,
  webinarID: ObjectIdType,
  callback: (packet: packetParams) => void
) {
  try {
    const userPromise = User.model
      .updateOne({ _id: userID }, { $addToSet: { attendedWebinars: webinarID } })
      .exec();
    const webinarPromise = Webinar.model
      .updateOne({ _id: webinarID }, { $addToSet: { attendees_V2: userID } })
      .exec();

    return Promise.all([userPromise, webinarPromise]).then((values) => {
      return callback(
        sendPacket(1, 'Succesfully updated attended list for webinar and user')
      );
    });
  } catch (err) {
    log('error', err);
    return callback(sendPacket(0, 'Error retrieving user or webinar'));
  }
}

export async function getSelfUserCommunities(userID: ObjectIdType) {
  try {
    //Getting correct values from database
    const communitySelectFields = [
      'name',
      'description',
      'private',
      'members',
      'type',
      'profilePicture',
      'admin',
    ];

    const user = await User.model
      .findById(userID)
      .select(['joinedCommunities', 'pendingCommunities', 'connections'])
      .populate({ path: 'connections', select: ['accepted', 'from', 'to'] })
      .populate({ path: 'joinedCommunities', select: communitySelectFields })
      .populate({ path: 'pendingCommunities', select: communitySelectFields })
      .exec();

    if (!user)
      return sendPacket(
        0,
        `Couldn't find user with id ${userID} to get communities for`
      );

    let { joinedCommunities, pendingCommunities } = user as {
      joinedCommunities: { [key: string]: any & ICommunity }[];
      pendingCommunities: { [key: string]: any & ICommunity }[];
    };
    const connections = connectionsToUserIDStrings(
      userID,
      user.connections as IConnection[]
    );

    //Cleaning up joined and pending communities
    for (let i = 0; i < joinedCommunities.length; i++) {
      joinedCommunities[i] = await addCalculatedCommunityFields(
        connections,
        joinedCommunities[i].toObject() as {
          [key: string]: any;
          _id: ObjectIdType;
          admin: ObjectIdType;
          members: ObjectIdType[];
        }
      );

      joinedCommunities[i].status = U2CR.JOINED;
    }

    for (let i = 0; i < pendingCommunities.length; i++) {
      pendingCommunities[i] = await addCalculatedCommunityFields(
        connections,
        pendingCommunities[i].toObject()
      );

      pendingCommunities[i].status = U2CR.PENDING;
    }

    joinedCommunities = await addProfilePicturesAll(
      joinedCommunities,
      'communityProfile'
    );
    pendingCommunities = await addProfilePicturesAll(
      pendingCommunities,
      'communityProfile'
    );

    return sendPacket(
      1,
      'Successfully retrieved all joined and pending communities.',
      { joinedCommunities, pendingCommunities }
    );
  } catch (err) {
    log('error', err);
    return sendPacket(-1, err);
  }
}

export async function getOtherUserCommunities(
  selfID: ObjectIdType,
  userID: ObjectIdType
) {
  try {
    //Getting correct values from database
    const communitySelectFields = [
      'name',
      'description',
      'private',
      'members',
      'type',
      'profilePicture',
      'admin',
    ];

    const selfUser = await User.model
      .findById(selfID)
      .select(['joinedCommunities', 'pendingCommunities', 'connections'])
      .populate({ path: 'connections', select: ['accepted', 'from', 'to'] })
      .exec();

    const otherUser = await User.model
      .findById(userID)
      .select(['joinedCommunities'])
      .populate({ path: 'joinedCommunities', select: communitySelectFields })
      .exec();

    if (!selfUser || !otherUser)
      return sendPacket(0, `Couldn't find User to get communities for`);

    const selfUserConnections = connectionsToUserIDStrings(
      selfID,
      selfUser.connections as IConnection[]
    );

    //Cleaning up joined and pending communities
    for (let i = 0; i < otherUser.joinedCommunities.length; i++) {
      const cleanedCommunity = await addCalculatedCommunityFields(
        selfUserConnections,
        (otherUser.joinedCommunities[i] as {
          [key: string]: any;
          _id: ObjectIdType;
          admin: ObjectIdType;
          members: ObjectIdType[];
        }).toObject()
      );

      getUserToCommunityRelationship(
        selfUser.joinedCommunities as ObjectIdType[],
        selfUser.pendingCommunities as ObjectIdType[],
        otherUser.joinedCommunities[i] as ICommunity,
        cleanedCommunity
      );

      otherUser.joinedCommunities[i] = cleanedCommunity;
    }

    const joinedWithImages = await addProfilePicturesAll(
      otherUser.joinedCommunities,
      'communityProfile'
    );

    return sendPacket(
      1,
      'Successfully retrieved all joined and pending communities.',
      { joinedCommunities: joinedWithImages, pendingCommunities: [] }
    );
  } catch (err) {
    log('error', err);
    return sendPacket(-1, err);
  }
}

export async function getSelfConnectionsFullData(selfID: string) {
  try {
    const currUser = await User.model
      .findOne({ _id: selfID }, [
        'connections',
        'pendingConnections',
        'joinedCommunities',
        'firstName',
      ])
      .populate({ path: 'connections', select: ['accepted', 'from', 'to'] })
      .populate({ path: 'pendingConnections', select: ['from', 'to'] });

    const connectionUserIDs = connectionsToUserIDs(selfID, currUser.connections);

    const pendingUserIDs = pendingToUserIDs(selfID, currUser.pendingConnections);

    let connectionsWithData = await User.model
      .find({ _id: { $in: connectionUserIDs } }, [
        'firstName',
        'lastName',
        'graduationYear',
        'university',
        'work',
        'position',
        'connections',
        'pendingConnections',
        'joinedCommunities',
        'profilePicture',
      ])
      .populate({ path: 'university', select: ['universityName'] })
      .populate({ path: 'connections', select: ['accepted', 'from', 'to'] });

    let pendingWithData = await User.model
      .find({ _id: { $in: pendingUserIDs } }, [
        'firstName',
        'lastName',
        'graduationYear',
        'university',
        'work',
        'position',
        'connections',
        'pendingConnections',
        'joinedCommunities',
        'profilePicture',
      ])
      .populate({ path: 'university', select: ['universityName'] })
      .populate({ path: 'connections', select: ['accepted', 'from', 'to'] });

    for (let i = 0; i < connectionsWithData.length; i++) {
      let cleanedConnection: any = connectionsWithData[i].toObject();
      cleanedConnection.connections = connectionsToUserIDStrings(
        connectionsWithData[i]._id,
        connectionsWithData[i].connections as IConnection[]
      );
      cleanedConnection = await addCalculatedUserFields(
        connectionUserIDs,
        currUser.joinedCommunities as ObjectIdType[],
        cleanedConnection
      );

      cleanedConnection.status = U2UR.CONNECTED;
      connectionsWithData[i] = cleanedConnection;
    }

    for (let i = 0; i < pendingWithData.length; i++) {
      let cleanedPending: any = pendingWithData[i].toObject();
      cleanedPending.connections = connectionsToUserIDStrings(
        pendingWithData[i]._id,
        pendingWithData[i].connections as IConnection[]
      );
      cleanedPending = await addCalculatedUserFields(
        connectionUserIDs,
        currUser.joinedCommunities as ObjectIdType[],
        cleanedPending
      );

      getUserToUserRelationship(
        currUser.connections as IConnection[],
        currUser.pendingConnections as IConnection[],
        pendingWithData[i] as {
          [key: string]: any;
          _id: ObjectIdType;
          connections: IConnection[];
          pendingConnections: ObjectIdType[];
          joinedCommunities: ObjectIdType[];
        },
        cleanedPending
      );

      pendingWithData[i] = cleanedPending;
    }

    connectionsWithData = await addProfilePicturesAll(
      connectionsWithData,
      'profile'
    );
    pendingWithData = await addProfilePicturesAll(pendingWithData, 'profile');

    return sendPacket(1, 'Successfully retrieved all connections', {
      connections: connectionsWithData,
      pendingConnections: pendingWithData,
    });
  } catch (err) {
    log('error', err);
    return sendPacket(-1, err);
  }
}

export async function getOtherConnectionsFullData(
  selfID: ObjectIdType,
  userID: ObjectIdType
) {
  try {
    const selfUser = await User.model
      .findOne({ _id: selfID }, [
        'connections',
        'pendingConnections',
        'joinedCommunities',
        'firstName',
      ])
      .populate({ path: 'connections', select: ['accepted', 'from', 'to'] })
      .populate({ path: 'pendingConnections', select: ['from', 'to'] });

    const otherUser = await User.model
      .findOne({ _id: userID }, ['connections', 'firstName'])
      .populate({
        path: 'connections',
        select: ['accepted', 'from', 'to'],
      });

    const selfConnectionUserIDStrings = connectionsToUserIDStrings(
      selfID,
      selfUser.connections as IConnection[]
    );
    const otherConnectionUserIDs = connectionsToUserIDs(
      userID,
      otherUser.connections
    );

    let connectionsWithData = await User.model
      .find({ _id: { $in: otherConnectionUserIDs } }, [
        'firstName',
        'lastName',
        'graduationYear',
        'university',
        'work',
        'position',
        'connections',
        'pendingConnections',
        'joinedCommunities',
        'profilePicture',
      ])
      .populate({ path: 'university', select: ['universityName'] })
      .populate({ path: 'connections', select: ['accepted', 'from', 'to'] });

    for (let i = 0; i < connectionsWithData.length; i++) {
      let cleanedConnection: any = connectionsWithData[i].toObject();
      cleanedConnection.connections = connectionsToUserIDStrings(
        connectionsWithData[i]._id,
        connectionsWithData[i].connections as IConnection[]
      );
      cleanedConnection = await addCalculatedUserFields(
        selfConnectionUserIDStrings,
        selfUser.joinedCommunities as ObjectIdType[],
        cleanedConnection
      );

      getUserToUserRelationship(
        selfUser.connections as IConnection[],
        selfUser.pendingConnections as IConnection[],
        connectionsWithData[i] as {
          [key: string]: any;
          _id: ObjectIdType;
          connections: IConnection[];
          pendingConnections: ObjectIdType[];
          joinedCommunities: ObjectIdType[];
        },
        cleanedConnection
      );

      connectionsWithData[i] = cleanedConnection;
    }

    connectionsWithData = await addProfilePicturesAll(
      connectionsWithData,
      'profile'
    );
    return sendPacket(1, 'Successfully retrieved all connections', {
      connections: connectionsWithData,
      pendingConnections: [],
    });
  } catch (err) {
    log('error', err);
    return sendPacket(-1, err);
  }
}

export async function getUserAdminCommunities(userID: string) {
  try {
    const user = await User.model
      .findById(userID)
      .select(['joinedCommunities'])
      .populate({
        path: 'joinedCommunities',
        select: 'admin name profilePicture',
        populate: [
          {
            path: 'followingCommunities',
            select: 'to',
            populate: { path: 'to', select: 'name accepted' },
          },
          {
            path: 'outgoingPendingCommunityFollowRequests',
            select: 'to',
            populate: { path: 'to', select: 'name accepted' },
          },
        ],
      });
    if (!user) return sendPacket(0, 'Could not find user');

    const communities = (user.joinedCommunities as ICommunity[]).filter(
      (community) => community.admin.toString() === userID
    );

    for (let i = 0; i < communities.length; i++) {
      const profilePicture = await retrieveSignedUrl(
        'communityProfile',
        communities[i].profilePicture
      );
      if (profilePicture) communities[i].profilePicture = profilePicture;
    }
    log('info', `Retrieved admin communities for user ${userID}`);
    return sendPacket(1, 'Successfully retrieved admin communities', {
      communities,
    });
  } catch (err) {
    log('error', err);
    return sendPacket(-1, err);
  }
}

export async function getBasicUserInfo(userID: string) {
  const user = await User.model
    .findById(userID)
    .select(['firstName', 'lastName'])
    .exec();
  if (!user) return sendPacket(-1, 'Could not find user');
  log('info', `Retrieved basic info for user ${userID}`);
  return sendPacket(1, 'Found user info', { user });
}

export async function getUsersGeneric(
  _ids: ObjectIdType[],
  params: {
    fields?: typeof User.AcceptedFields[number][];
    options?: GetUsersByIDsOptions;
  }
) {
  const { fields, options } = params;
  try {
    const users = await User.getUsersByIDs(_ids, { fields, options });
    return sendPacket(1, 'Successfully retrieved users', { users });
  } catch (err) {
    log('error', err);
    return sendPacket(-1, 'Failed to retrieve users', { error: err.message });
  }
}
