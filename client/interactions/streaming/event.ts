const mongoose = require('mongoose');
import { Webinar, Conversation, User } from '../../models';

const aws = require('aws-sdk');
aws.config.loadFromPath('../keys/aws_key.json');

import { log, sendPacket, formatTime, formatDate } from '../../helpers/functions';

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
    {
      $lookup: {
        from: 'users',
        localField: 'speakers',
        foreignField: '_id',
        as: 'speakers',
      },
    },
    { $unwind: '$host' },
    {
      $addFields: {
        speakers: {
          $map: {
            input: '$speakers',
            in: {
              _id: '$$this._id',
              firstName: '$$this.firstName',
              lastName: '$$this.lastName',
              email: '$$this.email',
            },
          },
        },
      },
    },
    {
      $project: {
        host: {
          _id: '$host._id',
          firstName: '$host.firstName',
          lastName: '$host.lastName',
          email: '$host.email',
        },
        speakers: '$speakers',
        title: '$title',
        brief_description: '$brief_description',
        full_description: '$full_description',
        dateTime: '$dateTime',
      },
    },
  ])
    .exec()
    .then((webinars) => {
      if (!webinars) return callback(sendPacket(-1, 'Could not find Events'));
      callback(
        sendPacket(1, 'Sending Events', {
          webinars,
        })
      );
    })
    .catch((err) => callback(sendPacket(-1, err)));
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
        userSpeaker: { $in: [mongoose.Types.ObjectId(userID), '$speakers'] },
        host: {
          _id: '$host._id',
          firstName: '$host.firstName',
          lastName: '$host.lastName',
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

      return addUserRSVP(userID, webinars, callback);
    })
    .catch((err) => callback(sendPacket(-1, err)));
}

function addUserRSVP(userID, webinars, callback) {
  User.aggregate([
    { $match: { _id: mongoose.Types.ObjectId(userID) } },
    { $project: { RSVPWebinars: '$RSVPWebinars' } },
  ])
    .exec()
    .then((users) => {
      if (!users || users.length === 0)
        return callback(sendPacket(-1, 'Could not find User'));
      let RSVPWebinars = users[0].RSVPWebinars;
      for (let i = 0; i < RSVPWebinars.length; i++) {
        RSVPWebinars[i] = RSVPWebinars[i].toString();
      }
      webinars.forEach((webinar) => {
        webinar.userRSVP =
          RSVPWebinars && RSVPWebinars.includes(webinar._id.toString());
      });

      return callback(sendPacket(1, 'Sending Events', { webinars }));
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

export function updateRSVP(userID, webinarID, didRSVP, callback) {
  User.findById(userID, ['RSVPWebinars'], (err, user) => {
    if (err) return callback(sendPacket(-1, err));
    if (!user)
      return callback(sendPacket(-1, 'Could not find user to RSVP to the webinar'));

    let RSVPWebinars = formatElementsToStrings(user.RSVPWebinars);
    const alreadyRSVPUser = RSVPWebinars.includes(webinarID);

    if (didRSVP && !alreadyRSVPUser) user.RSVPWebinars.push(webinarID);
    else if (!didRSVP && alreadyRSVPUser)
      user.RSVPWebinars.splice(user.RSVPWebinars.indexOf(webinarID), 1);

    user.save((err, user) => {
      if (err) return callback(sendPacket(-1, err));
      if (!user)
        return callback(sendPacket(-1, 'Could not save user RSVP to the webinar'));

      callback(
        sendPacket(1, 'Updated RSVP state', {
          newRSVP: didRSVP,
        })
      );
    });
  });
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

function formatElementsToStrings(array) {
  let newArray = [];
  array.forEach((element) => {
    newArray.push(element.toString());
  });

  return newArray;
}
