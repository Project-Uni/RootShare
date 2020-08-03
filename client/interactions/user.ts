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
  User.find({ firstName: 'Smit' }, (err, suggestions) => {
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
