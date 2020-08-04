const mongoose = require('mongoose');
const User = mongoose.model('users');
const ConnectionRequest = mongoose.model('connectionRequests');

import sendPacket from '../helpers/sendPacket';

export function getCurrentUser(user, callback) {
  if (!user || user === undefined || user === null)
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

export function getConnections(user, callback) {
  if (!user) return callback(sendPacket(0, 'User not found'));

  User.find({}, ['_id', 'firstName', 'lastName'], (err, users) => {
    if (err) return callback(sendPacket(-1, err));
    if (!users) return callback(sendPacket(0, 'Could not get connections'));

    return callback(sendPacket(1, 'Sending Connections', { connections: users }));
  });
}

export function getConnectionSuggestions(user, callback) {
  User.find({ lastName: 'Desai' }, (err, suggestions) => {
    if (err) return callback(sendPacket(-1, err));
    if (!suggestions)
      return callback(sendPacket(0, 'Could not find test suggestions'));

    callback(sendPacket(1, 'Sending connection suggestions', { suggestions }));
  });
  // User.aggregate([
  //   { $sample: { size: 15 } },
  //   {
  //     $lookup: {
  //       from: 'universities',
  //       localField: 'university',
  //       foreignField: '_id',
  //       as: 'university',
  //     },
  //   },
  //   { $unwind: '$university' },
  //   {
  //     $project: {
  //       _id: '$_id',
  //       firstName: '$firstName',
  //       lastName: '$lastName',
  //       university: {
  //         _id: '$university._id',
  //         universityName: '$university.universityName',
  //       },
  //     },
  //   },
  // ])
  //   .exec()
  //   .then((suggestions) =>
  //     callback(sendPacket(1, 'Sending connection suggestions', { suggestions }))
  //   )
  //   .catch((err) => callback(sendPacket(-1, err)));
}

export function getPendingRequests(userID, callback) {
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
      $addFields: {
        pendingConnections: {
          $map: {
            input: '$pendingConnections',
            in: {
              _id: '$$this._id',
              from: '$$this.from',
              to: '$$this.to',
              createdAt: '$$this.createdAt',
            },
          },
        },
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
      if (!user || user.length === 0) return callback(0, 'Could not get user');

      callback(
        sendPacket(1, `Sending User's Pending Connection Requests`, {
          pendingRequests: user[0].pendingConnections,
        })
      );
    })
    .catch((err) => callback(sendPacket(-1, err)));
}

export function requestConnection(userID, requestUserID, callback) {
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

    if (!accepted && (request['to'] === userID || request['from'] === userID))
      return removeConnectionRequest(request, callback);
    else if (accepted && request['to'] === userID)
      return acceptConnectionRequest(request, callback);
    else return callback(sendPacket(0, 'Invalid Request'));
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
    (err, users) => {
      if (err) return callback(sendPacket(-1, err));
      if (!users || users.length !== 2)
        return callback(sendPacket(0, 'Could not find Users to Connect'));

      for (let i = 0; i < 2; i++) {
        // Add Connection
        users[i].connections.push(
          users[i]._id === userOneID ? userTwoID : userOneID
        );

        // Remove Request from User's pending
        users[i].pendingConnections.splice(
          users[i].pendingConnections.indexOf(request._id)
        );
      }

      console.log(users);
      return callback(sendPacket(1, 'TESTTT'));
      users.save((err) => {
        if (err) return callback(-1, err);

        return removeConnectionRequest(request._id, callback);
      });
    }
  );
}

function removeConnectionRequest(requestID, callback) {
  ConnectionRequest.deleteOne({ _id: requestID }, (err) => {
    if (err) return callback(sendPacket(-1, err));

    return callback(sendPacket(1, 'Successfully removed connection request'));
  });
}
