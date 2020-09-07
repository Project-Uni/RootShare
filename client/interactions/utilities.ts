import sendPacket from '../helpers/sendPacket';

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

export function countAccountType(users) {
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
