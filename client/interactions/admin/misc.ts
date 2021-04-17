import { User } from '../../rootshare_db/models';
import { packetParams } from '../../rootshare_db/types';
import { log, sendPacket, sendEmail } from '../../helpers/functions';
import { sleep } from '../utilities';

export const getUserData = (callback: (packet: packetParams) => void) => {
  User.model.find(
    {},
    [
      'firstName',
      'lastName',
      'createdAt',
      'accountType',
      'email',
      'phoneNumber',
      'graduationYear',
      'major',
      'work',
      'position',
      'department',
      'graduateSchool',
    ],
    {},
    (err, users) => {
      if (err || users === undefined || users === null) {
        return callback(sendPacket(-1, 'Could not find users'));
      }

      const {
        studentCount,
        alumniCount,
        facultyCount,
        recruiterCount,
      } = countAccountType(users);
      return callback(
        sendPacket(1, 'Found users', {
          users,
          studentCount,
          alumniCount,
          facultyCount,
          recruiterCount,
        })
      );
    }
  );
};

const countAccountType = (users) => {
  const accountTypes = ['student', 'alumni', 'faculty', 'recruiter'];
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
    recruiterCount: 0,
  };

  for (let i = 0; i < numTypes; i++) {
    retCounts[`${accountTypes[i]}Count`] = accountCounts[i];
  }

  return retCounts;
};

export const phasedEmergencyEmailRollout = async (
  subject: string,
  message: string
) => {
  const users = await User.model.find({}, ['email']).exec();
  for (let i = 0; i < users.length; i++) {
    const email = users[i].email;
    try {
      sendEmail([email], subject, message);
    } catch (err) {
      log('error', err);
    }
    if (i % 25 === 0) {
      log('info', `Sent batch ${Math.ceil(i / 25)} of emergency emails`);
      await sleep(2);
    }
  }
  log('info', `Successfully sent email ${subject} to all users`);
  return true;
};
