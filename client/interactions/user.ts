const mongoose = require('mongoose');
const User = mongoose.model('users');

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
    .then((suggestions) =>
      callback(sendPacket(1, 'Sending connection suggestions', { suggestions }))
    )
    .catch((err) => callback(sendPacket(-1, err)));
}
