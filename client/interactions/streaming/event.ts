const mongoose = require('mongoose');
import { Webinar, Connection, Conversation, User } from '../../models';

const aws = require('aws-sdk');
aws.config.loadFromPath('../keys/aws_key.json');

import {
  log,
  sendPacket,
  formatTime,
  formatDate,
  uploadFile,
  decodeBase64Image,
  retrieveSignedUrl,
} from '../../helpers/functions';

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
      isDev: eventBody['isDev'],
    });
    newWebinar.save((err, webinar) => {
      if (err || !webinar)
        return callback(sendPacket(-1, 'Failed to create webinar'));

      addRSVPs(webinar._id, formatSpeakers(webinar.speakers, webinar.host));
      sendEventEmailConfirmation(
        webinar,
        eventBody['speakerEmails'],
        eventBody['host']['email']
      );

      callback(sendPacket(1, 'Successfully created webinar', { webinar }));
    });
  });
}

function updateEvent(eventBody, callback) {
  Webinar.findById(eventBody['editEvent'], (err, webinar) => {
    if (err || !webinar)
      return callback(sendPacket(-1, "Couldn't find event to update"));

    removeRSVPs(webinar._id, formatSpeakers(webinar.speakers, webinar.host));
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

      addRSVPs(webinar._id, formatSpeakers(webinar.speakers, webinar.host));
      sendEventEmailConfirmation(
        webinar,
        eventBody['speakerEmails'],
        eventBody['host']['email']
      );

      return callback(sendPacket(1, 'Successfully updated webinar', { webinar }));
    });
  });
}

function addRSVPs(webinarID, speakers) {
  const speakerIDs = formatElementsToObjectIds(speakers);
  const webinarPromise = Webinar.updateOne(
    { _id: webinarID },
    { $addToSet: { RSVPs: { $each: speakers } } }
  ).exec();
  const userPromise = User.updateMany(
    { _id: { $in: speakerIDs } },
    { $addToSet: { RSVPWebinars: webinarID.toString() } }
  ).exec();
  return Promise.all([webinarPromise, userPromise])
    .then(([webinar, user]) => {
      log('info', 'Successfully added RSVPs');
    })
    .catch((err) => log('err', err));
}

function removeRSVPs(webinarID, oldSpeakers) {
  const oldSpeakerIDs = formatElementsToObjectIds(oldSpeakers);

  const webinarPromise = Webinar.updateOne(
    { _id: webinarID },
    { $pull: { RSVPs: { $in: oldSpeakers } } }
  ).exec();
  const userPromise = User.updateMany(
    { _id: { $in: oldSpeakerIDs } },
    { $pull: { RSVPWebinars: webinarID.toString() } }
  ).exec();

  return Promise.all([webinarPromise, userPromise])
    .then(([webinar, user]) => {
      log('info', 'Successfully removed RSVPs');
    })
    .catch((err) => log('err', err));
}

export function timeStampCompare(ObjectA, ObjectB) {
  const a = ObjectA.dateTime !== undefined ? ObjectA.dateTime : new Date();
  const b = ObjectB.dateTime !== undefined ? ObjectB.dateTime : new Date();

  if (b < a) return 1;
  if (a < b) return -1;
  return 0;
}

export async function getAllRecentEvents(userID: string, callback) {
  let events = await Webinar.find(
    {
      $and: [
        { isDev: false },
        {
          $or: [
            { muxAssetPlaybackID: { $ne: undefined } },
            { dateTime: { $gte: new Date().getTime() - 240 * 60 * 1000 } },
          ],
        },
      ],
    },
    [
      'title',
      'brief_description',
      'full_description',
      'RSVPs',
      'dateTime',
      'hostCommunity',
      'muxAssetPlaybackID',
      'eventImage',
    ]
  )
    .populate({ path: 'hostCommunity', select: ['_id', 'name'] })
    .sort({ dateTime: 1 })
    .exec();

  events = await addEventImagesAll(events, 'eventImage');
  if (!events) return callback(sendPacket(-1, `Couldn't get recent events`));

  const { connections } = await User.findOne({ _id: userID }, [
    'connections',
  ]).populate({ path: 'connections', select: ['from', 'to'] });

  const connectionIDs = connections.reduce((output, connection) => {
    const otherID =
      connection['from'].toString() != userID.toString()
        ? connection['from']
        : connection['to'];

    output.push(otherID);

    return output;
  }, []);

  return callback(
    sendPacket(1, 'Successfully retrieved recent events', { events, connectionIDs })
  );
}

export async function getAllEventsAdmin(callback) {
  Webinar.aggregate([
    // { $match: { dateTime: { $gt: new Date() } } },
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
        isDev: '$isDev',
        isPrivate: '$isPrivate',
        eventImage: '$eventImage',
        eventBanner: '$eventBanner',
      },
    },
  ])
    .exec()
    .then(async (webinars) => {
      if (!webinars) return callback(sendPacket(-1, 'Could not find Events'));

      webinars = await addEventImagesAll(webinars, 'eventImage');
      if (!webinars)
        return callback(sendPacket(-1, `Couldn't add images to events`));
      webinars = await addEventImagesAll(webinars, 'eventBanner');
      if (!webinars)
        return callback(sendPacket(-1, `Couldn't add banner images to events`));

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
    { $match: { dateTime: { $gt: new Date() }, isDev: { $ne: true } } },
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

      return addUserDidRSVP(userID, webinars, callback);
    })
    .catch((err) => callback(sendPacket(-1, err)));
}

function addUserDidRSVP(userID, webinars, callback) {
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
      'muxAssetPlaybackID',
      'eventImage',
      'eventBanner',
    ],
    async (err, webinar) => {
      if (err) {
        log('error', err);
        return callback(sendPacket(-1, 'There was an error finding webinar'));
      } else if (!webinar || webinar === undefined || webinar == null) {
        return callback(sendPacket(0, 'No webinar exists with this ID'));
      }

      webinar = webinar.toObject();
      const eventImagePromise = retrieveSignedUrl('eventImage', webinar.eventImage);
      const eventBannerPromise = retrieveSignedUrl(
        'eventBanner',
        webinar.eventBanner
      );
      Promise.all([eventImagePromise, eventBannerPromise]).then(
        ([eventImage, eventBanner]) => {
          webinar.eventImage = eventImage || undefined;
          webinar.eventBanner = eventBanner || undefined;

          return callback(
            sendPacket(1, 'Succesfully found webinar details', { webinar })
          );
        }
      );
    }
  );
}

export function updateRSVP(userID, webinarID, didRSVP, callback) {
  canUpdateRSVP(userID, webinarID, (packet) => {
    if (packet.success !== 1) return callback(packet);

    User.findById(userID, ['RSVPWebinars'], (err, user) => {
      if (err) return callback(sendPacket(-1, err));
      if (!user)
        return callback(
          sendPacket(-1, 'Could not find user to RSVP to the webinar')
        );

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
  });
}

function canUpdateRSVP(userID, webinarID, callback) {
  Webinar.findById(webinarID, ['host', 'speakers'], (err, webinar) => {
    if (err) return callback(sendPacket(-1, err));
    if (!webinar) return callback(sendPacket(0, "Webinar doesn't exist"));

    if (
      webinar.speakers.includes(userID) ||
      userID.toString() === webinar.host.toString()
    )
      return callback(sendPacket(0, 'User cannot update RSVP'));

    return callback(sendPacket(1, 'User can update RSVP'));
  });
}

export async function addEventImage(eventID, image) {
  if (image === undefined) return sendPacket(1, 'No image was provided');

  if (image === '') {
    const remove = await Webinar.updateOne(
      { _id: eventID },
      { eventImage: undefined }
    );
    if (remove.nModified !== 1)
      return sendPacket(-1, 'Failed to remove image from event');
    return sendPacket(1, 'Successfully removed event image');
  }

  const imageBuffer: { type?: string; data?: Buffer } = decodeBase64Image(image);
  if (!imageBuffer.data) return sendPacket(-1, 'Could not decode event image');

  const imageName = `${eventID}_eventImage.jpeg`;
  const success = await uploadFile('eventImage', imageName, imageBuffer.data);
  if (!success) return sendPacket(-1, 'Could not upload event image');

  const upload = await Webinar.updateOne(
    { _id: eventID },
    { eventImage: imageName }
  );
  if (upload.nModified !== 1) return sendPacket(-1, 'Failed to add image to event');
  return sendPacket(1, 'Successfully uploaded event image');
}

export async function addEventBanner(eventID, image) {
  if (image === undefined) return sendPacket(1, 'No image was provided');

  if (image === '') {
    const remove = await Webinar.updateOne(
      { _id: eventID },
      { eventBanner: undefined }
    );
    if (remove.nModified !== 1)
      return sendPacket(-1, 'Failed to remove banner from event');
    return sendPacket(1, 'Successfully removed event banner');
  }

  const imageBuffer: { type?: string; data?: Buffer } = decodeBase64Image(image);
  if (!imageBuffer.data) return sendPacket(-1, 'Could not decode event banner');

  const imageName = `${eventID}_eventBanner.jpeg`;
  const success = await uploadFile('eventBanner', imageName, imageBuffer.data);
  if (!success) return sendPacket(-1, 'Could not upload event banner');

  const upload = await Webinar.updateOne(
    { _id: eventID },
    { eventBanner: imageName }
  );
  if (upload.nModified !== 1) return sendPacket(-1, 'Failed to add banner to event');
  return sendPacket(1, 'Successfully uploaded event banner');
}

function addEventImagesAll(events, imageReason: 'eventImage' | 'eventBanner') {
  const imagePromises = [];

  for (let i = 0; i < events.length; i++) {
    if (events[i][imageReason]) {
      try {
        const signedImageURLPromise = retrieveSignedUrl(
          imageReason,
          events[i][imageReason]
        );
        imagePromises.push(signedImageURLPromise);
      } catch (err) {
        imagePromises.push(null);
        log('error', 'There was an error retrieving a signed url from S3');
      }
    } else {
      imagePromises.push(null);
    }
  }

  return Promise.all(imagePromises)
    .then((signedImageURLs) => {
      for (let i = 0; i < signedImageURLs.length; i++)
        if (signedImageURLs[i]) events[i][imageReason] = signedImageURLs[i];

      return events;
    })
    .catch((err) => {
      log('error', err);
      return false;
    });
}

function formatElementsToStrings(array) {
  let newArray = [];
  array.forEach((element) => {
    newArray.push(element.toString());
  });

  return newArray;
}

function formatElementsToObjectIds(array) {
  let newArray = [];
  array.forEach((element) => {
    newArray.push(mongoose.Types.ObjectId(element));
  });

  return newArray;
}
function formatSpeakers(speakers, host) {
  if (speakers.includes(host)) return speakers;
  else return speakers.concat(host);
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
