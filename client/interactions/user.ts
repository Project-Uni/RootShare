const mongoose = require('mongoose');
import { User, Connection, Webinar } from '../models';

import { log, sendPacket, retrieveSignedUrl } from '../helpers/functions';
import { extractOtherUserIDFromConnections } from './utilities';

export function getCurrentUser(user, callback) {
  if (!user) return callback(sendPacket(0, 'User not found'));

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

export async function getPublicProfileInformation(userID, callback) {
  try {
    mongoose.Types.ObjectId(userID);
  } catch (err) {
    return callback(sendPacket(-1, err));
  }

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
        sendPacket(1, 'Sending public user information', { user: users[0] })
      );
    })
    .catch((err) => callback(sendPacket(-1, err)));
}

export function getUserEvents(userID, callback) {
  User.aggregate([
    { $match: { _id: mongoose.Types.ObjectId(userID) } },
    {
      $lookup: {
        from: 'webinars',
        let: { rsvps: '$RSVPWebinars' },
        pipeline: [
          { $match: { $expr: { $in: ['$_id', '$$rsvps'] } } },
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
    $project: { connections: ['$connections.from', '$connections.to'] },
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
    .then((user) => {
      if (!user || user.length === 0)
        return callback(sendPacket(-1, 'Could not find connections'));

      callback(
        sendPacket(1, "Sending User's Connections", {
          connections: user[0]['connections'],
        })
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
          },
        },
      ])
        .exec()
        .then((user) => {
          if (!user || user.length === 0)
            return callback(sendPacket(-1, "Couldn't get User"));
          const suggestions = filterSuggestions(user[0], rawSuggestions);
          callback(sendPacket(1, 'Sending Connection suggestions', { suggestions }));
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
    .then((user) => {
      if (!user || user.length === 0)
        return callback(sendPacket(0, 'Could not get user'));

      callback(
        sendPacket(1, `Sending User's Pending Connection Requests`, {
          pendingRequests: user[0].pendingConnections,
        })
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

              callback(sendPacket(1, 'Connection request has been sent!'));
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
  userID = userID.toString();
  requestUserID = requestUserID.toString();
  if (requestUserID.localeCompare(userID) === 0)
    return callback(
      sendPacket(1, "Can't be connected to yourself", {
        connected: 'SELF',
      })
    );

  Connection.find(
    {
      $or: [
        { $and: [{ from: userID }, { to: requestUserID }] },
        { $and: [{ from: requestUserID }, { to: userID }] },
      ],
    },
    (err, connections) => {
      if (err) return callback(sendPacket(-1, err));
      if (!connections || connections.length === 0)
        return callback(
          sendPacket(1, 'Not yet connected to this user', { connected: 'PUBLIC' })
        );

      const connection = connections[0];
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

export async function getUserCommunities(userID: string) {
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
      .populate({ path: 'connections', select: ['from', 'to'] })
      .populate({ path: 'joinedCommunities', select: communitySelectFields })
      .populate({ path: 'pendingCommunities', select: communitySelectFields })
      .exec();

    if (!user) return sendPacket(0, `Could find user with id ${userID}`);

    const { joinedCommunities, pendingCommunities } = user;
    const connections = extractOtherUserIDFromConnections(
      userID,
      user['connections']
    );

    //Cleaning up joined and pending communities
    for (let i = 0; i < joinedCommunities.length; i++) {
      //Updating Profile Picture
      if (joinedCommunities[i].profilePicture) {
        try {
          const signedProfilePicture = await retrieveSignedUrl(
            'communityProfile',
            joinedCommunities[i].profilePicture
          );
          if (signedProfilePicture)
            joinedCommunities[i].profilePicture = signedProfilePicture;
        } catch (err) {
          log('error', err);
        }
      }

      //Calculating Mutual Connections
      const mutualConnections = connections.filter((connection) => {
        return joinedCommunities[i].members.indexOf(connection) !== -1;
      });

      const cleanedCommunity = {
        _id: joinedCommunities[i]._id,
        name: joinedCommunities[i].name,
        description: joinedCommunities[i].description,
        private: joinedCommunities[i].private,
        type: joinedCommunities[i].type,
        admin: joinedCommunities[i].admin,
        profilePicture: joinedCommunities[i].profilePicture,
        numMembers: joinedCommunities[i].members.length,
        numMutual: mutualConnections.length,
      };

      joinedCommunities[i] = cleanedCommunity;
    }

    for (let i = 0; i < pendingCommunities.length; i++) {
      //Updating Profile Picture
      if (pendingCommunities[i].profilePicture) {
        try {
          const signedProfilePicture = await retrieveSignedUrl(
            'communityProfile',
            pendingCommunities[i].profilePicture
          );
          if (signedProfilePicture)
            pendingCommunities[i].profilePicture = signedProfilePicture;
        } catch (err) {
          log('error', err);
        }
      }

      //Calculating Mutual Connections
      const mutualConnections = connections.filter((connection) => {
        return pendingCommunities[i].members.indexOf(connection) !== -1;
      });

      const cleanedCommunity = {
        _id: pendingCommunities[i]._id,
        name: pendingCommunities[i].name,
        description: pendingCommunities[i].description,
        private: pendingCommunities[i].private,
        type: pendingCommunities[i].type,
        admin: pendingCommunities[i].admin,
        profilePicture: pendingCommunities[i].profilePicture,
        numMembers: pendingCommunities[i].members.length,
        numMutual: mutualConnections.length,
      };

      pendingCommunities[i] = cleanedCommunity;
    }

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

export async function getConnectionsFullData(userID: string) {
  try {
    const { connections, joinedCommunities } = await User.findOne({ _id: userID }, [
      'connections',
      'joinedCommunities',
    ]).populate({ path: 'connections', select: ['from', 'to'] });

    const connectionIDs = connections.reduce((output, connection) => {
      const otherID =
        connection['from'].toString() != userID.toString()
          ? connection['from']
          : connection['to'];

      output.push(otherID);

      return output;
    }, []);

    const connectionsWithData = await User.find({ _id: { $in: connectionIDs } }, [
      'firstName',
      'lastName',
      'graduationYear',
      'university',
      'work',
      'position',
      'connections',
      'joinedCommunities',
      'profilePicture',
    ])
      .populate({ path: 'university', select: ['universityName'] })
      .populate({ path: 'connections', select: ['from', 'to'] });

    for (let i = 0; i < connectionsWithData.length; i++) {
      if (connectionsWithData[i].profilePicture) {
        try {
          const imageURL = await retrieveSignedUrl(
            'profile',
            connectionsWithData[i].profilePicture
          );
          if (imageURL) connectionsWithData[i].profilePicture = imageURL;
        } catch (err) {
          log('error', err);
        }
      }
    }

    return sendPacket(1, 'successfully retrieved all connections', {
      connections: connectionsWithData,
      connectionIDs: connectionIDs,
      joinedCommunities: joinedCommunities,
    });
  } catch (err) {
    log('error', err);
    return sendPacket(-1, err);
  }
}
