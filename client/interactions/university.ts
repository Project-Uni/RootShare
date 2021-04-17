import { University, User } from '../rootshare_db/models';
import { packetParams, ObjectIdType } from '../rootshare_db/types';
import { log, sendPacket } from '../helpers/functions';

export async function getDepartments(
  userID: ObjectIdType,
  callback: (packet: packetParams) => void
) {
  try {
    const { university: universityID } = await User.model
      .findOne({ _id: userID }, 'university')
      .exec();
    University.model.findById(
      universityID,
      ['departments'],
      {},
      (err, university) => {
        if (err) {
          log('error', err.message);
          return callback(sendPacket(-1, err.message));
        }
        if (!university) return callback(sendPacket(0, 'Could not find University'));

        return callback(
          sendPacket(1, 'Sending University departments', {
            departments: university.departments,
          })
        );
      }
    );
  } catch (err) {
    return callback(sendPacket(-1, 'Failed to get departments'));
  }
}
