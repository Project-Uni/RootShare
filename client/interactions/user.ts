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
  if (!user || user === undefined || user === null)
    return callback(sendPacket(0, 'User not found'));

  User.find({}, ['_id', 'firstName', 'lastName'], (err, users) => {
    if (err || users === undefined || users === null)
      return callback(sendPacket(-1, 'Could not get connections'));
    return callback(sendPacket(1, 'Sending Connections', { connections: users }));
  });
}
