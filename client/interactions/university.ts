import { log, sendPacket } from '../helpers/functions';
import { University, User } from '../models';

export async function getDepartments(userID, callback) {
  try {
    const { university: universityID } = await User.findOne(
      { _id: userID },
      'university'
    ).exec();
    University.findById(universityID, ['departments'], (err, university) => {
      if (err) {
        log('error', err);
        return callback(sendPacket(-1, err));
      }
      if (!university) return callback(sendPacket(0, 'Could not find University'));

      return callback(
        sendPacket(1, 'Sending University departments', {
          departments: university.departments,
        })
      );
    });
  } catch (err) {
    return callback(sendPacket(-1, 'Failed to get departments'));
  }
}
