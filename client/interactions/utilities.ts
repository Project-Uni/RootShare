import sendPacket from '../helpers/sendPacket';

import { User } from '../models';

module.exports = {
  getUserData: (callback) => {
    User.find(
      {},
      ['firstName', 'lastName', 'createdAt', 'accountType'],
      (err, users) => {
        if (err || users === undefined || users === null) {
          return callback(sendPacket(-1, 'Could not find users'));
        }

        const {
          studentCount,
          alumniCount,
          facultyCount,
          fanCount,
        } = module.exports.countAccountType(users);
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
  },

  countAccountType: (users) => {
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

    let retCounts = {};
    for (let i = 0; i < numTypes; i++) {
      retCounts[`${accountTypes[i]}Count`] = accountCounts[i];
    }

    return retCounts;
  },
};
