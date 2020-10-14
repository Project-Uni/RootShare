const mongoose = require('mongoose');
import { User, Connection, Webinar } from '../models';

import { log, sendPacket, retrieveSignedUrl } from '../helpers/functions';
import {
  addCalculatedUserFields,
  getUserToUserRelationship,
  addCalculatedCommunityFields,
  getUserToCommunityRelationship,
  connectionsToUserIDStrings,
  connectionsToUserIDs,
  pendingToUserIDs,
  addProfilePictureToUser,
  addProfilePicturesAll,
} from './utilities';

export async function getCurrentUser(user, callback) {
  if (!user) return callback(sendPacket(0, 'User not found'));
  await addProfilePictureToUser(user);

  return callback(
    sendPacket(1, 'Found current User', {
      email: user.email,
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      privilegeLevel: user.privilegeLevel || 1,
      accountType: user.accountType,
      profilePicture: user.profilePicture,
    })
  );
}

export async function getPrivateProfileInformation(userID, callback) {
  User.aggregate([
    { $match: { _id: mongoose.Types.ObjectId(userID) } },
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
    .catch((err) => callback(sendPacket(-1, err)));
}

export async function getPublicProfileInformation(selfUserID, userID, callback) {
  try {
    mongoose.Types.ObjectId(userID);
    mongoose.Types.ObjectId(selfUserID);

    const selfUserPromise = User.findById(selfUserID, [
      'connections',
      'joinedCommunities',
    ])
      .populate({ path: 'connections', select: ['accepted', 'from', 'to'] })
      .exec();

    const otherUserPromise = User.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(userID) } },
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
    ]).exec();

    Promise.all([selfUserPromise, otherUserPromise]).then(
      async ([selfUser, otherUserOutput]) => {
        if (!selfUser || !otherUserOutput || otherUserOutput.length === 0)
          return callback(sendPacket(0, 'Could not find the given user'));

        let otherUser = otherUserOutput[0];
        const selfConnections = connectionsToUserIDStrings(
          selfUserID,
          selfUser.connections
        );

        otherUser.connections = connectionsToUserIDStrings(
          otherUser._id,
          otherUser.connections
        );

        otherUser = await addCalculatedUserFields(
          selfConnections,
          selfUser.joinedCommunities,
          otherUser
        );

        return callback(
          sendPacket(1, 'Sending public user information', { user: otherUser })
        );
      }
    );
  } catch (err) {
    return callback(sendPacket(-1, err));
  }
}

export function getUserEvents(userID, callback) {
  User.aggregate([
    { $match: { _id: mongoose.Types.ObjectId(userID) } },
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
              userSpeaker: { $in: [mongoose.Types.ObjectId(userID), '$speakers'] },
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

export function updateProfileInformation(userID, profileData, callback) {
  User.findById(
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
    (err, user) => {
      if (err) return callback(sendPacket(-1, err));
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
        if (err) return callback(sendPacket(-1, err));
        return callback(sendPacket(1, 'Successfully updated user profile!'));
      });
    }
  );
}

export function updateUserBio(userID, newBio, callback) {
  User.updateOne({ _id: userID }, { bio: newBio }, (err, update) => {
    if (err) return callback(sendPacket(-1, err));
    if (update.n === 0) return callback(sendPacket(0, 'Could not find User'));
    return callback(sendPacket(1, "Updated user's bio"));
  });
}

// TODO: either send these in chunks or store all connections in redux when user logs in
export function getConnections(userID, callback) {
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
            $ne: ['$$connection', mongoose.Types.ObjectId(userID)],
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
  User.aggregate([
    { $match: { _id: mongoose.Types.ObjectId(userID) } },
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

      const connections = user[0].connections;
      callback(
        await addProfilePicturesAll(
          connections,
          `Sending User's connections`,
          'connections',
          'profile'
        )
      );
    })
    .catch((err) => {
      if (err) return callback(sendPacket(-1, err));
    });
}

export function getConnectionSuggestions(userID, callback) {
  User.aggregate([
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
      User.aggregate([
        { $match: { _id: mongoose.Types.ObjectId(userID) } },
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

          callback(
            await addProfilePicturesAll(
              suggestions,
              'Sending Connection suggestions',
              'suggestions',
              'profile'
            )
          );
        });
    })
    .catch((err) => {
      if (err) callback(sendPacket(-1, err));
    });
}

// Removes suggestions that are already pending or connected
function filterSuggestions(user, suggestions) {
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

export function getPendingRequests(userID, callback) {
  User.aggregate([
    { $match: { _id: mongoose.Types.ObjectId(userID) } },
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
                  $eq: ['$$pendingConnection.to', userID],
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

      callback(
        await addProfilePicturesAll(
          pendingRequests,
          `Sending User's Pending Connection Requests`,
          'pendingRequests',
          'profile'
        )
      );
    })
    .catch((err) => {
      if (err) callback(sendPacket(-1, err));
    });
}

export function requestConnection(userID, requestUserID, callback) {
  checkConnectedWithUser(userID, requestUserID, (packet) => {
    if (packet.success !== 1 || packet.content.connected !== 'PUBLIC')
      return callback(packet);

    const newConnectionRequest = new Connection({
      from: userID,
      to: requestUserID,
    });

    newConnectionRequest.save((err, connectionRequest) => {
      if (err) return callback(sendPacket(-1, err));
      if (!connectionRequest)
        return callback(sendPacket(0, 'Could not save request'));

      User.findById(userID, (err, user) => {
        if (err) return callback(sendPacket(-1, err));
        if (!user)
          return callback(sendPacket(0, 'Could not find user to save request FROM'));

        if (!user.pendingConnections)
          user.pendingConnections = [connectionRequest._id];
        else user.pendingConnections.push(connectionRequest._id);

        user.save((err, user) => {
          if (err) return callback(sendPacket(-1, err));
          if (!user)
            return callback(sendPacket(0, 'Could not save request FROM user'));

          User.findById(requestUserID, (err, requestedUser) => {
            if (err) return callback(sendPacket(-1, err));
            if (!requestedUser)
              return callback(
                sendPacket(0, 'Could not find user to send request TO')
              );

            if (!requestedUser.pendingConnections)
              requestedUser.pendingConnections = [connectionRequest._id];
            else requestedUser.pendingConnections.push(connectionRequest._id);

            requestedUser.save((err, requestedUser) => {
              if (err) return callback(sendPacket(-1, err));
              if (!requestedUser)
                return callback(sendPacket(0, 'Could not save request TO user'));

              callback(
                sendPacket(1, 'Connection request has been sent!', {
                  requestID: connectionRequest._id,
                })
              );
            });
          });
        });
      });
    });
  });
}

export function respondConnection(userID, requestID, accepted, callback) {
  Connection.findById(requestID, (err, request) => {
    if (err) return callback(sendPacket(-1, err));
    if (!request)
      return callback(sendPacket(0, 'Could not find Connection Request'));

    const isRequestee = userID.toString().localeCompare(request['to']) === 0;
    const isRequester = userID.toString().localeCompare(request['from']) === 0;
    if (!accepted && (isRequestee || isRequester))
      return removeConnectionRequest(request, callback);
    else if (accepted && isRequestee)
      return acceptConnectionRequest(request, callback);
    else return callback(sendPacket(0, 'Cannot process request'));
  });
}

function acceptConnectionRequest(request, callback) {
  const userOneID = request['from'];
  const userTwoID = request['to'];

  User.find(
    {
      _id: {
        $in: [
          mongoose.Types.ObjectId(userOneID),
          mongoose.Types.ObjectId(userTwoID),
        ],
      },
    },
    ['connections', 'pendingConnections'],
    async (err, users) => {
      if (err) return callback(sendPacket(-1, err));
      if (!users || users.length !== 2)
        return callback(sendPacket(0, 'Could not find Users to Connect'));

      for (let i = 0; i < 2; i++) {
        // Checks for duplicate connections: this is one point where multiple
        // simultaneous requests could cause duplicates (low severity issue)
        if (users[i].connections.indexOf(request._id) === -1) {
          if (!users[i].connections) users[i].connections = [request._id];
          users[i].connections.push(request._id);
        }

        // Checks that request exists in array
        const removeIndex = users[i].pendingConnections.indexOf(request._id);
        if (removeIndex !== -1) users[i].pendingConnections.splice(removeIndex, 1);

        try {
          await users[i].save();
        } catch (err) {
          log('error', `Couldn't save User`);
          if (err) return callback(sendPacket(-1, err));
        }
      }

      Connection.findById(request._id, ['accepted'], (err, connection) => {
        if (err) return callback(sendPacket(-1, err));
        if (!connection)
          return callback(sendPacket(0, 'Could not find Connection to update'));

        connection.accepted = true;
        connection.save((err) => {
          if (err) return callback(sendPacket(-1, err));
          callback(sendPacket(1, 'Connection Accepted!'));
        });
      });
    }
  );
}

function removeConnectionRequest(request, callback) {
  const userOneID = request['from'];
  const userTwoID = request['to'];

  User.find(
    {
      _id: {
        $in: [
          mongoose.Types.ObjectId(userOneID),
          mongoose.Types.ObjectId(userTwoID),
        ],
      },
    },
    ['connections', 'pendingConnections'],
    async (err, users) => {
      if (err) return callback(sendPacket(-1, err));
      if (!users || users.length !== 2)
        return callback(
          sendPacket(0, 'Could not find Users to remove Connection Request from')
        );

      for (let i = 0; i < 2; i++) {
        // Checks if request exists in pending array and removes it
        if (users[i].pendingConnections) {
          const removePendingIndex = users[i].pendingConnections.indexOf(
            request._id
          );
          if (removePendingIndex !== -1) {
            users[i].pendingConnections.splice(removePendingIndex, 1);
            try {
              await users[i].save();
            } catch (err) {
              log('error', `Couldn't save User`);
              if (err) return callback(sendPacket(-1, err));
            }
          }
        }

        // Checks if request exists in connections array and removes it
        if (users[i].connections) {
          const removeConnectionIndex = users[i].connections.indexOf(request._id);
          if (removeConnectionIndex !== -1) {
            users[i].connections.splice(removeConnectionIndex, 1);
            try {
              await users[i].save();
            } catch (err) {
              log('error', `Couldn't save User`);
              if (err) return callback(sendPacket(-1, err));
            }
          }
        }
      }

      Connection.deleteOne({ _id: request._id }, (err) => {
        if (err) return callback(sendPacket(-1, err));

        return callback(sendPacket(1, 'Successfully removed connection request'));
      });
    }
  );
}

export function checkConnectedWithUser(userID, requestUserID, callback) {
  try {
    userID = userID.toString();
    requestUserID = requestUserID.toString();
    if (requestUserID.localeCompare(userID) === 0)
      return callback(
        sendPacket(1, "Can't be connected to yourself", {
          connected: 'SELF',
        })
      );

    Connection.findOne(
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
            sendPacket(1, 'Not yet connected to this user', { connected: 'PUBLIC' })
          );

        if (connection.accepted)
          return callback(
            sendPacket(1, 'Already connected to this User', {
              connected: 'CONNECTION',
            })
          );
        else if (connection.from.toString() === requestUserID)
          return callback(
            sendPacket(1, 'This User has already sent you a request', {
              connected: 'FROM',
            })
          );
        else if (connection.to.toString() === requestUserID)
          return callback(
            sendPacket(1, 'Request has already been sent to this User', {
              connected: 'TO',
            })
          );
        else return callback(sendPacket(-1, 'An error has occured'));
      }
    );
  } catch (err) {
    return callback(sendPacket(-1, err));
  }
}

export function getConnectionWithUser(userID, requestUserID, callback) {
  userID = userID.toString();
  requestUserID = requestUserID.toString();
  if (requestUserID.localeCompare(userID) === 0)
    return callback(sendPacket(0, "Can't be connected to yourself"));

  Connection.find(
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
  userID: string,
  webinarID: string,
  callback: (packet: {
    success: number;
    message: string;
    content?: { [key: string]: any };
  }) => any
) {
  try {
    let userPromise = User.findById(userID).exec();
    let webinarPromise = Webinar.findById(webinarID).exec();

    return Promise.all([userPromise, webinarPromise]).then((values) => {
      const [user, webinar] = values;
      if (user) {
        if (user.attendedWebinars) {
          if (!user.attendedWebinars.includes(webinarID)) {
            user.attendedWebinars.push(webinarID);
            log(
              'info',
              `Added webinar ${webinarID} to ${user.firstName} ${user.lastName}`
            );
          }
        } else {
          user.attendedWebinars = [webinarID];
          log(
            'info',
            `Added webinar ${webinarID} to ${user.firstName} ${user.lastName}`
          );
        }
      }
      //TODO - decide which method for setting is better and stick with it
      //TODO - mark attendees as modified
      if (webinar) {
        if (webinar.attendees) {
          if (!(userID in webinar)) webinar.attendees[userID] = 1;
        } else webinar.attendees = { userID: 1 };
      }

      const userSavePromise = user.save();
      const webinarSavePromise = webinar.save();

      return Promise.all([userSavePromise, webinarSavePromise]).then(
        ([savedUser, savedWebinar]) => {
          return callback(
            sendPacket(
              1,
              'Successfully updated attendee list for user and for webinar'
            )
          );
        }
      );
    });
  } catch (err) {
    log('error', err);
    return callback(sendPacket(0, 'Error retrieving user or webinar'));
  }
}

export async function getSelfUserCommunities(userID: string) {
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

    const user = await User.findById(userID)
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

    const { joinedCommunities, pendingCommunities } = user;
    const connections = connectionsToUserIDStrings(userID, user['connections']);

    //Cleaning up joined and pending communities
    for (let i = 0; i < joinedCommunities.length; i++) {
      joinedCommunities[i] = await addCalculatedCommunityFields(
        connections,
        joinedCommunities[i].toObject()
      );

      joinedCommunities[i].status = 'JOINED';
    }

    for (let i = 0; i < pendingCommunities.length; i++) {
      pendingCommunities[i] = await addCalculatedCommunityFields(
        connections,
        pendingCommunities[i].toObject()
      );

      pendingCommunities[i].status = 'PENDING';
    }

    const joinedPacket = await addProfilePicturesAll(
      joinedCommunities,
      '',
      'joined',
      'communityProfile'
    );
    if (joinedPacket.success !== 1) return joinedPacket;

    const pendingPacket = await addProfilePicturesAll(
      pendingCommunities,
      '',
      'pending',
      'communityProfile'
    );
    if (pendingPacket.success !== 1) return pendingPacket;

    return sendPacket(
      1,
      'Successfully retrieved all joined and pending communities.',
      {
        joinedCommunities: joinedPacket.content.joined,
        pendingCommunities: pendingPacket.content.pending,
      }
    );
  } catch (err) {
    log('error', err);
    return sendPacket(-1, err);
  }
}

export async function getOtherUserCommunities(selfID: string, userID: string) {
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

    const selfUser = await User.findById(selfID)
      .select(['joinedCommunities', 'pendingCommunities', 'connections'])
      .populate({ path: 'connections', select: ['accepted', 'from', 'to'] })
      .exec();

    const otherUser = await User.findById(userID)
      .select(['joinedCommunities'])
      .populate({ path: 'joinedCommunities', select: communitySelectFields })
      .exec();

    if (!selfUser || !otherUser)
      return sendPacket(0, `Couldn't find User to get communities for`);

    const selfUserConnections = connectionsToUserIDStrings(
      selfID,
      selfUser['connections']
    );

    //Cleaning up joined and pending communities
    for (let i = 0; i < otherUser.joinedCommunities.length; i++) {
      const cleanedCommunity = await addCalculatedCommunityFields(
        selfUserConnections,
        otherUser.joinedCommunities[i].toObject()
      );

      getUserToCommunityRelationship(
        selfUser.joinedCommunities,
        selfUser.pendingCommunities,
        otherUser.joinedCommunities[i],
        cleanedCommunity
      );

      otherUser.joinedCommunities[i] = cleanedCommunity;
    }

    const joinedPacket = await addProfilePicturesAll(
      otherUser.joinedCommunities,
      '',
      'joined',
      'communityProfile'
    );
    if (joinedPacket.success !== 1) return joinedPacket;

    return sendPacket(
      1,
      'Successfully retrieved all joined and pending communities.',
      { joinedCommunities: joinedPacket.content.joined, pendingCommunities: [] }
    );
  } catch (err) {
    log('error', err);
    return sendPacket(-1, err);
  }
}

export async function getSelfConnectionsFullData(selfID: string) {
  try {
    const currUser = await User.findOne({ _id: selfID }, [
      'connections',
      'pendingConnections',
      'joinedCommunities',
      'firstName',
    ])
      .populate({ path: 'connections', select: ['accepted', 'from', 'to'] })
      .populate({ path: 'pendingConnections', select: ['from', 'to'] });

    const connectionUserIDs = connectionsToUserIDs(selfID, currUser.connections);

    const pendingUserIDs = pendingToUserIDs(selfID, currUser.pendingConnections);

    const connectionsWithData = await User.find(
      { _id: { $in: connectionUserIDs } },
      [
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
      ]
    )
      .populate({ path: 'university', select: ['universityName'] })
      .populate({ path: 'connections', select: ['accepted', 'from', 'to'] });

    const pendingWithData = await User.find({ _id: { $in: pendingUserIDs } }, [
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
      let cleanedConnection = connectionsWithData[i].toObject();
      cleanedConnection.connections = connectionsToUserIDStrings(
        connectionsWithData[i]._id,
        connectionsWithData[i].connections
      );
      cleanedConnection = await addCalculatedUserFields(
        connectionUserIDs,
        currUser.joinedCommunities,
        cleanedConnection
      );

      cleanedConnection.status = 'CONNECTION';
      connectionsWithData[i] = cleanedConnection;
    }

    for (let i = 0; i < pendingWithData.length; i++) {
      let cleanedPending = pendingWithData[i].toObject();
      cleanedPending.connections = connectionsToUserIDStrings(
        pendingWithData[i]._id,
        pendingWithData[i].connections
      );
      cleanedPending = await addCalculatedUserFields(
        connectionUserIDs,
        currUser.joinedCommunities,
        cleanedPending
      );

      getUserToUserRelationship(
        currUser.connections,
        currUser.pendingConnections,
        pendingWithData[i],
        cleanedPending
      );

      pendingWithData[i] = cleanedPending;
    }

    const connectionsPacket = await addProfilePicturesAll(
      connectionsWithData,
      '',
      'connections',
      'profile'
    );
    if (connectionsPacket.success !== 1) return connectionsPacket;

    const pendingPacket = await addProfilePicturesAll(
      pendingWithData,
      '',
      'pending',
      'profile'
    );
    if (pendingPacket.success !== 1) return pendingPacket;

    return sendPacket(1, 'Successfully retrieved all connections', {
      connections: connectionsPacket.content.connections,
      pendingConnections: pendingPacket.content.pending,
    });
  } catch (err) {
    log('error', err);
    return sendPacket(-1, err);
  }
}

export async function getOtherConnectionsFullData(selfID: string, userID: string) {
  try {
    const selfUser = await User.findOne({ _id: selfID }, [
      'connections',
      'pendingConnections',
      'joinedCommunities',
      'firstName',
    ])
      .populate({ path: 'connections', select: ['accepted', 'from', 'to'] })
      .populate({ path: 'pendingConnections', select: ['from', 'to'] });

    const otherUser = await User.findOne({ _id: userID }, [
      'connections',
      'firstName',
    ]).populate({
      path: 'connections',
      select: ['accepted', 'from', 'to'],
    });

    const selfConnectionUserIDStrings = connectionsToUserIDStrings(
      selfID,
      selfUser.connections
    );
    const otherConnectionUserIDs = connectionsToUserIDs(
      userID,
      otherUser.connections
    );

    const connectionsWithData = await User.find(
      { _id: { $in: otherConnectionUserIDs } },
      [
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
      ]
    )
      .populate({ path: 'university', select: ['universityName'] })
      .populate({ path: 'connections', select: ['accepted', 'from', 'to'] });

    for (let i = 0; i < connectionsWithData.length; i++) {
      let cleanedConnection = connectionsWithData[i].toObject();
      cleanedConnection.connections = connectionsToUserIDStrings(
        connectionsWithData[i]._id,
        connectionsWithData[i].connections
      );
      cleanedConnection = await addCalculatedUserFields(
        selfConnectionUserIDStrings,
        selfUser.joinedCommunities,
        cleanedConnection
      );

      getUserToUserRelationship(
        selfUser.connections,
        selfUser.pendingConnections,
        connectionsWithData[i],
        cleanedConnection
      );

      connectionsWithData[i] = cleanedConnection;
    }

    const packet = await addProfilePicturesAll(
      connectionsWithData,
      '',
      'connections',
      'profile'
    );
    if (packet.success !== 1) return packet;
    const connectionsWithImages = packet.content.connections;

    return sendPacket(1, 'Successfully retrieved all connections', {
      connections: connectionsWithImages,
      pendingConnections: [],
    });
  } catch (err) {
    log('error', err);
    return sendPacket(-1, err);
  }
}

export async function getUserAdminCommunities(userID: string) {
  try {
    const user = await User.findById(userID)
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

    const communities = user.joinedCommunities.filter(
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
  const user = await User.findById(userID).select(['firstName', 'lastName']).exec();
  if (!user) return sendPacket(-1, 'Could not find user');
  log('info', `Retrieved basic info for user ${userID}`);
  return sendPacket(1, 'Found user info', { user });
}
