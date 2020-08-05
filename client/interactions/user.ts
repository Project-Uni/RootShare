const mongoose = require('mongoose');
const User = mongoose.model('users');
const ConnectionRequest = mongoose.model('connectionRequests');

import sendPacket from '../helpers/sendPacket';
import log from '../helpers/logger';

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

export function getConnections(userID, callback) {
  User.aggregate([
    { $match: { _id: mongoose.Types.ObjectId(userID) } },
    {
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
              _id: '_id',
              firstName: '$firstName',
              lastName: '$lastName',
              university: {
                _id: '$university._id',
                universityName: '$university.universityName',
              },
            },
          },
        ],
        as: 'connections',
      },
    },
    {
      $project: {
        connections: '$connections',
      },
    },
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
        university: {
          _id: '$university._id',
          universityName: '$university.universityName',
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
            from: 'connectionrequests',
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

function filterSuggestions(user, suggestions) {
  let excludedUsers = new Set();
  excludedUsers.add(user._id.toString());
  user.connections.forEach((connection) => {
    excludedUsers.add(connection.toString());
  });
  user.pendingConnections.forEach((pendingConnection) => {
    excludedUsers.add(pendingConnection.from.toString());
    excludedUsers.add(pendingConnection.to.toString());
  });

  const result = suggestions.filter(
    (suggestion) => !excludedUsers.has(suggestion._id.toString())
  );
  return result;
}

export function getPendingRequests(userID, callback) {
  User.aggregate([
    { $match: { _id: mongoose.Types.ObjectId(userID) } },
    {
      $lookup: {
        from: 'connectionrequests',
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
                    university: {
                      _id: '$university._id',
                      universityName: '$university.universityName',
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
              $eq: ['$$pendingConnection.to', userID],
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
  if (requestUserID.toString().localeCompare(userID) === 0)
    return callback(sendPacket(0, "Can't connect with yourself"));

  User.aggregate([
    { $match: { _id: mongoose.Types.ObjectId(userID) } },
    {
      $lookup: {
        from: 'connectionrequests',
        localField: 'pendingConnections',
        foreignField: '_id',
        as: 'pendingConnections',
      },
    },
    {
      $project: {
        isConnected: {
          $in: [mongoose.Types.ObjectId(requestUserID), '$connections'],
        },
        isPendingFrom: {
          $in: [mongoose.Types.ObjectId(requestUserID), '$pendingConnections.from'],
        },
        isPendingTo: {
          $in: [mongoose.Types.ObjectId(requestUserID), '$pendingConnections.to'],
        },
      },
    },
  ])
    .exec()
    .then((response) => {
      if (!response || response.length === 0)
        return callback(-1, 'Error occurred checking request');
      if (response[0].isConnected)
        return callback(sendPacket(0, 'Already connected to this User'));
      if (response[0].isPendingFrom)
        return callback(sendPacket(0, 'This User has already sent you a request'));
      if (response[0].isPendingTo)
        return callback(sendPacket(0, 'Request has already been sent to this User'));

      createConnectionRequest(userID, requestUserID, callback);
    })
    .catch((err) => {
      if (err) callback(sendPacket(-1, err));
    });
}

function createConnectionRequest(userID, requestUserID, callback) {
  const newConnectionRequest = new ConnectionRequest({
    from: userID,
    to: requestUserID,
  });

  newConnectionRequest.save((err, connectionRequest) => {
    if (err) return callback(sendPacket(-1, err));
    if (!connectionRequest) return callback(sendPacket(0, 'Could not save request'));

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
            return callback(sendPacket(0, 'Could not find user to send request TO'));

          if (!requestedUser.pendingConnections)
            requestedUser.pendingConnections = [connectionRequest._id];
          else requestedUser.pendingConnections.push(connectionRequest._id);

          requestedUser.save((err, requestedUser) => {
            if (err) return callback(sendPacket(-1, err));
            if (!requestedUser)
              return callback(sendPacket(0, 'Could not save request TO user'));

            callback(sendPacket(1, 'Saved new Connection Request'));
          });
        });
      });
    });
  });
}

export function respondConnection(userID, requestID, accepted, callback) {
  ConnectionRequest.findById(requestID, (err, request) => {
    if (err) return callback(sendPacket(-1, err));
    if (!request)
      return callback(sendPacket(0, 'Could not find Connection Request'));

    const isRequestee = userID.toString().localeCompare(request['to']) === 0;
    const isRequester = userID.toString().localeCompare(request['from']) === 0;
    if (!accepted && (isRequestee || isRequester))
      return removeConnectionRequest(request, callback);
    else if (accepted && isRequestee)
      return acceptConnectionRequest(request, callback);
    else return callback(sendPacket(0, 'Cannot accept request'));
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
    ['connections'],
    async (err, users) => {
      if (err) return callback(sendPacket(-1, err));
      if (!users || users.length !== 2)
        return callback(sendPacket(0, 'Could not find Users to Connect'));

      for (let i = 0; i < 2; i++) {
        // Checks for duplicate connections
        const connectionIndex = users[i].connections.indexOf(request._id);
        if (connectionIndex !== -1) continue;

        // Connects users to each other
        users[i].connections.push(
          users[i]._id.toString().localeCompare(userOneID) === 0
            ? userTwoID
            : userOneID
        );

        try {
          await users[i].save();
        } catch (err) {
          log('error', `Couldn't save User`);
          if (err) return callback(sendPacket(-1, err));
        }
      }

      return removeConnectionRequest(request, callback);
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
    ['pendingConnections'],
    async (err, users) => {
      if (err) return callback(sendPacket(-1, err));
      if (!users || users.length !== 2)
        return callback(
          sendPacket(0, 'Could not find Users to remove Connection Request from')
        );

      for (let i = 0; i < 2; i++) {
        // Checks that request exists in array
        const removeIndex = users[i].pendingConnections.indexOf(request._id);
        if (removeIndex === -1) continue;

        // Remove Request from each User's pending
        users[i].pendingConnections.splice(removeIndex);
        try {
          await users[i].save();
        } catch (err) {
          log('error', `Couldn't save User`);
          if (err) return callback(sendPacket(-1, err));
        }
      }

      ConnectionRequest.deleteOne({ _id: request._id }, (err) => {
        if (err) return callback(sendPacket(-1, err));

        return callback(sendPacket(1, 'Successfully removed connection request'));
      });
    }
  );
}
