import { User, Webinar } from '../models';

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

export function getConnections(user, callback) {
  if (!user || user === undefined || user === null)
    return callback(sendPacket(0, 'User not found'));

  User.find({}, ['_id', 'firstName', 'lastName'], (err, users) => {
    if (err || user === undefined || users === null)
      return callback(sendPacket(-1, 'Could not get connections'));
    return callback(sendPacket(1, 'Sending Connections', { connections: users }));
  });
}

export async function updateAttendingList(
  userID: string,
  webinarID: string,
  callback: (packet: {
    success: number;
    message: string;
    content?: { [key: string]: any };
  }) => any
) {
  try {
    let userPromise = User.findById(userID).exec();
    let webinarPromise = Webinar.findById(webinarID).exec();

    Promise.all([userPromise, webinarPromise]).then((values) => {
      const [user, webinar] = values;
      if (user) {
        if (user.attendedWebinars) {
          let containsWebinar = false;
          for (let i = 0; i < user.attendedWebinars.length; i++) {
            if (user.attendedWebinars[i].toString() === webinarID) {
              containsWebinar = true;
              break;
            }
          }

          if (!containsWebinar) user.attendedWebinars.push(webinarID);
        } else user.attendedWebinars = [webinarID];
      }
      //TODO - decide which method for setting is better and stick with it
      if (webinar) {
        if (webinar.attendees) {
          if (!(userID in webinar)) webinar.attendees[userID] = 1;
        } else webinar.attendees = { userID: 1 };
      }

      const userSavePromise = user.save();
      const webinarSavePromise = webinar.save();

      Promise.all([userSavePromise, webinarSavePromise]).then(
        ([savedUser, savedWebinar]) => {
          return callback(
            sendPacket(
              1,
              'Successfully updated attendee list for user and for webinar'
            )
          );
        }
      );
    });
  } catch (err) {
    log('error', err);
    return callback(sendPacket(0, 'Error retrieving user or webinar'));
  }
}
