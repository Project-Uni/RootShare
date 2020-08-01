const mongoose = require('mongoose');
const Webinar = mongoose.model('webinars');
const User = mongoose.model('users');
const Conversation = mongoose.model('conversations');

const aws = require('aws-sdk');
aws.config.loadFromPath('../keys/aws_key.json');

import log from '../../helpers/logger';
import sendPacket from '../../helpers/sendPacket';
import { formatTime, formatDate } from '../../helpers/dateFormat';

let ses = new aws.SES({
  apiVersion: '2010-12-01',
});

export async function createEvent(
  eventBody: { [key: string]: any },
  user: { [key: string]: any },
  callback: (packet: any) => void
) {
  if (eventBody['editEvent'] !== '') return updateEvent(eventBody, callback);

  const newEventConversation = new Conversation({
    participants: [],
  });
  newEventConversation.save((err, conversation) => {
    if (err || conversation === undefined || conversation === null)
      return callback(sendPacket(-1, 'Failed to create event conversation'));

    const newWebinar = new Webinar({
      title: eventBody['title'],
      brief_description: eventBody['brief_description'],
      full_description: eventBody['full_description'],
      host: eventBody['host']['_id'],
      speakers: eventBody['speakers'],
      dateTime: eventBody['dateTime'],
      conversation: newEventConversation._id,
    });
    newWebinar.save((err, webinar) => {
      if (err || webinar === undefined || webinar === null)
        return callback(sendPacket(-1, 'Failed to create webinar'));

      callback(sendPacket(1, 'Successfully created webinar', webinar));
      sendEventEmailConfirmation(
        webinar,
        eventBody['speakerEmails'],
        eventBody['host']['email']
      );
    });
  });
}

function updateEvent(eventBody, callback) {
  Webinar.findById(eventBody['editEvent'], (err, webinar) => {
    if (err || webinar === undefined || webinar === null)
      return callback(sendPacket(-1, "Couldn't find event to update"));
    webinar.title = eventBody['title'];
    webinar.brief_description = eventBody['brief_description'];
    webinar.full_description = eventBody['full_description'];
    webinar.host = eventBody['host']['_id'];
    webinar.speakers = eventBody['speakers'];
    webinar.dateTime = eventBody['dateTime'];

    if (webinar.dateTime.getTime() > new Date().getTime() + 30 * 60 * 1000) {
      webinar.opentokSessionID = undefined;
      webinar.opentokBroadcastID = undefined;
      webinar.muxStreamKey = undefined;
      webinar.muxLiveStreamID = undefined;
      webinar.muxPlaybackID = undefined;
    }

    webinar.save((err, webinar) => {
      if (err) return callback(sendPacket(-1, "Couldn't update event"));

      sendEventEmailConfirmation(
        webinar,
        eventBody['speakerEmails'],
        eventBody['host']['email']
      );
      return callback(sendPacket(1, 'Successfully updated webinar'));
    });
  });
}

export function timeStampCompare(ObjectA, ObjectB) {
  const a = ObjectA.dateTime !== undefined ? ObjectA.dateTime : new Date();
  const b = ObjectB.dateTime !== undefined ? ObjectB.dateTime : new Date();

  if (b < a) return 1;
  if (a < b) return -1;
  return 0;
}

export async function getAllEventsAdmin(callback) {
  const webinars = await Webinar.find()
    .populate('host', 'firstName lastName email')
    .populate('speakers', 'firstName lastName email');

  if (!webinars) return callback(sendPacket(-1, 'Could not retrieve events'));

  webinars.sort(timeStampCompare);
  const upcoming = webinars.filter((webinar) => webinar.dateTime > new Date());
  return callback(sendPacket(1, 'Sending back all events', { webinars: upcoming }));
}

export async function getAllEventsUser(userID, callback) {
  Webinar.aggregate([
    { $match: { dateTime: { $gt: new Date() } } },
    { $sort: { createdAt: 1 } },
    {
      $lookup: {
        from: 'users',
        localField: 'host',
        foreignField: '_id',
        as: 'host',
      },
    },
    { $unwind: '$host' },
    {
      $project: {
        userRSVP: { $in: [mongoose.Types.ObjectId(userID), '$attendees'] },
        host: {
          _id: '$host._id',
          firstName: '$host.firstName',
          lastName: '$host.lastName',
          email: '$host.email',
        },
        title: '$title',
        brief_description: '$brief_description',
        full_description: '$full_description',
        availableCommunities: '$availableCommunities',
        conversation: '$conversation',
        dateTime: '$dateTime',
      },
    },
  ])
    .exec()
    .then((webinars) => {
      if (!webinars) return callback(sendPacket(-1, 'Could not find Events'));
      console.log(webinars);
      callback(
        sendPacket(1, 'Sending Events', {
          webinars,
        })
      );
    })
    .catch((err) => callback(sendPacket(-1, err)));
}

export async function getWebinarDetails(userID, webinarID, callback) {
  Webinar.findById(
    webinarID,
    [
      'title',
      'brief_description',
      'full_description',
      'host',
      'speakers',
      'attendees',
      'dateTime',
      'conversation',
      'muxPlaybackID',
    ],
    (err, webinar) => {
      if (err) {
        log('error', err);
        return callback(sendPacket(-1, 'There was an error finding webinar'));
      } else if (!webinar || webinar === undefined || webinar == null) {
        return callback(sendPacket(0, 'No webinar exists with this ID'));
      }

      return callback(
        sendPacket(1, 'Succesfully found webinar details', { webinar: webinar })
      );
    }
  );
}

function sendEventEmailConfirmation(
  webinarData: { [key: string]: any },
  speakerEmails: string[],
  hostEmail: string
) {
  const eventDateTime = webinarData['dateTime'];
  const body = `
  <p style={{fontSize: 14, fontFamily: 'Arial'}}>Hello! You have been invited to speak at an event on RootShare.</p>

  <p style={{fontSize: 14, fontFamily: 'Arial'}}><b>${webinarData['title']}<b></p>

  <p style={{fontSize: 14, fontFamily: 'Arial'}}>${
    webinarData['brief_description']
  }</p>

  <p style={{fontSize: 14, fontFamily: 'Arial'}}>${
    webinarData['full_description']
  }</p>

  <p style={{fontSize: 14, fontFamily: 'Arial'}}><b>On ${formatDate(
    eventDateTime
  )} at ${formatTime(eventDateTime)}<b></p>
  <p style={{fontSize: 14, fontFamily: 'Arial'}}>You can visit the page at https://www.rootshare.io/event/${
    webinarData['_id']
  }</p>

  <p style={{fontSize: 14, fontFamily: 'Arial'}}>See you there!</p>
  <p style={{fontSize: 14, fontFamily: 'Arial'}}>-The RootShare Team</p>

  `;

  var params = {
    Destination: {
      ToAddresses: [...speakerEmails, hostEmail],
    },
    Source: `RootShare Team <dev@rootshare.io>`,
    ReplyToAddresses: [],
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: body,
        },
      },
      Subject: {
        Data: 'RootShare Virtual Event Speaking Invite',
      },
    },
  };

  ses
    .sendEmail(params)
    .promise()
    .then((data) => {
      // log('info', data)
    })
    .catch((err) => {
      log('error', err);
    });
}
