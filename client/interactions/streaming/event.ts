import { Types } from 'mongoose';
const aws = require('aws-sdk');

import {
  Webinar,
  Conversation,
  User,
  IUser,
  IConnection,
  IWebinar,
} from '../../rootshare_db/models';
import { packetParams } from '../../rootshare_db/types';
import {
  log,
  sendPacket,
  formatTime,
  formatDate,
  uploadFile,
  decodeBase64Image,
  retrieveSignedUrl,
} from '../../helpers/functions';

const ObjectIdVal = Types.ObjectId;
type ObjectIdType = Types.ObjectId;

aws.config.loadFromPath('../keys/aws_key.json');
let ses = new aws.SES({
  apiVersion: '2010-12-01',
});

export async function createEvent(
  eventBody: { [key: string]: any },
  user: { [key: string]: any },
  callback: (packet: packetParams) => void
) {
  if (eventBody['editEvent'] !== '') return updateEvent(eventBody, callback);

  const newEventConversation = new Conversation.model({
    participants: [],
  });
  newEventConversation.save((err, conversation) => {
    if (err || conversation === undefined || conversation === null)
      return callback(sendPacket(-1, 'Failed to create event conversation'));

    const newWebinar = new Webinar.model({
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
        formatSpeakers(eventBody['speakerEmails'], eventBody['host']['email'])
      );

      callback(sendPacket(1, 'Successfully created webinar', { webinar }));
    });
  });
}

async function updateEvent(
  eventBody: any,
  callback: (packet: packetParams) => void
) {
  try {
    const webinar = await Webinar.model
      .findById(eventBody['editEvent'])
      .populate('speakers', 'email')
      .populate('host', 'email');
    if (!webinar) return callback(sendPacket(-1, "Couldn't find event to update"));

    webinar.host = webinar.host as IUser;
    const oldSpeakers = formatSpeakers(
      (webinar.speakers as IUser[]).map((speaker) => speaker._id),
      webinar.host._id
    );
    const oldSpeakerEmails = formatSpeakers(
      (webinar.speakers as IUser[]).map((speaker) => speaker.email),
      webinar.host.email
    );
    const newSpeakers = formatSpeakers(
      eventBody['speakers'],
      eventBody['host']['_id']
    );
    const newSpeakerEmails = formatSpeakers(
      eventBody['speakerEmails'],
      eventBody['host']['email']
    );
    removeRSVPs(webinar._id, oldSpeakers);
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

      addRSVPs(webinar._id, newSpeakers);
      const confirmationSpeakerEmails = newSpeakerEmails.filter(
        (speaker) => !oldSpeakerEmails.includes(speaker)
      );
      sendEventEmailConfirmation(webinar, confirmationSpeakerEmails);

      return callback(sendPacket(1, 'Successfully updated webinar', { webinar }));
    });
  } catch (err) {
    callback(sendPacket(-1, err));
  }
}

function addRSVPs(webinarID: ObjectIdType, speakers: ObjectIdType[]) {
  const webinarPromise = Webinar.model
    .updateOne({ _id: webinarID }, { $addToSet: { RSVPs: { $each: speakers } } })
    .exec();
  const userPromise = User.model
    .updateMany(
      { _id: { $in: speakers } },
      { $addToSet: { RSVPWebinars: webinarID } }
    )
    .exec();
  return Promise.all([webinarPromise, userPromise])
    .then(([webinar, user]) => {
      log('info', 'Successfully added RSVPs');
    })
    .catch((err) => log('err', err));
}

function removeRSVPs(webinarID: ObjectIdType, oldSpeakers: ObjectIdType[]) {
  const temp: any[] = [];

  const webinarPromise = Webinar.model
    .updateOne({ _id: webinarID }, { $pull: { RSVPs: oldSpeakers } })
    .exec();
  const userPromise = User.model
    .updateMany(
      { _id: { $in: oldSpeakers } },
      { $pull: { RSVPWebinars: webinarID.toString() } }
    )
    .exec();

  return Promise.all([webinarPromise, userPromise])
    .then(([webinar, user]) => {
      log('info', 'Successfully removed RSVPs');
    })
    .catch((err) => log('err', err));
}

export function timeStampCompare(
  ObjectA: { dateTime: Date },
  ObjectB: { dateTime: Date }
) {
  const a = ObjectA.dateTime !== undefined ? ObjectA.dateTime : new Date();
  const b = ObjectB.dateTime !== undefined ? ObjectB.dateTime : new Date();

  if (b < a) return 1;
  if (a < b) return -1;
  return 0;
}

export async function getAllRecentEvents(
  userID: ObjectIdType,
  callback: (packet: packetParams) => void
) {
  let events = await Webinar.model
    .find(
      {
        $and: [
          { isDev: false },
          {
            $or: [{ isMTG: false }, { isMTG: undefined }],
          },
          {
            $or: [
              { muxAssetPlaybackID: { $ne: undefined } },
              {
                dateTime: { $gte: new Date(new Date().getTime() - 240 * 60 * 1000) },
              },
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
        'eventBanner',
      ]
    )
    .populate({ path: 'hostCommunity', select: ['_id', 'name'] })
    .sort({ dateTime: 1 })
    .exec();

  events = await addEventImagesAll(events, 'eventBanner');
  if (!events) return callback(sendPacket(-1, `Couldn't get recent events`));

  const { connections } = await User.model
    .findOne({ _id: userID }, ['connections'])
    .populate({ path: 'connections', select: ['from', 'to'] });

  const connectionIDs = (connections as IConnection[]).reduce(
    (output, connection) => {
      const otherID =
        connection['from'].toString() != userID.toString()
          ? connection['from']
          : connection['to'];

      output.push(otherID);

      return output;
    },
    []
  );

  return callback(
    sendPacket(1, 'Successfully retrieved recent events', { events, connectionIDs })
  );
}

export async function getAllEventsAdmin(callback: (packet: packetParams) => void) {
  Webinar.model
    .aggregate([
      // { $match: { dateTime: { $gt: new Date() } } },
      { $sort: { createdAt: -1 } },
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

export async function getAllEventsUser(
  userID: ObjectIdType,
  callback: (packet: packetParams) => void
) {
  Webinar.model
    .aggregate([
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
          userSpeaker: { $in: [ObjectIdVal(userID.toString()), '$speakers'] },
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

function addUserDidRSVP(
  userID: ObjectIdType,
  webinars: { _id: ObjectIdType; userRSVP: boolean }[],
  callback: (packet: packetParams) => void
) {
  User.model
    .aggregate([
      { $match: { _id: ObjectIdVal(userID.toString()) } },
      { $project: { RSVPWebinars: '$RSVPWebinars' } },
    ])
    .exec()
    .then((users) => {
      if (!users || users.length === 0)
        return callback(sendPacket(-1, 'Could not find User'));
      let RSVPWebinars: ObjectIdType[] = users[0].RSVPWebinars;

      webinars.forEach((webinar) => {
        webinar.userRSVP = RSVPWebinars && RSVPWebinars.includes(webinar._id);
      });

      return callback(sendPacket(1, 'Sending Events', { webinars }));
    })
    .catch((err) => callback(sendPacket(-1, err)));
}

export async function deleteEvent(
  userID: ObjectIdType,
  eventID: ObjectIdType,
  callback: (packet: packetParams) => void
) {
  try {
    const deletePromise = Webinar.model.deleteOne({ _id: eventID });
    // const deletePromise = Webinar.deleteOne({ _id: eventID, host: userID });
    // USE THIS ONCE WE SETUP COMMUNITY EVENT CREATION AND DELETION
    const attendedPromise = User.model
      .updateMany(
        { attendedWebinars: eventID },
        { $pullAll: { attendedWebinars: [eventID] } }
      )
      .exec();
    const RSVPPromise = User.model
      .updateMany(
        { RSVPWebinars: eventID },
        { $pullAll: { RSVPWebinars: [eventID] } }
      )
      .exec();

    await Promise.all([deletePromise, attendedPromise, RSVPPromise]).then(
      ([deleteData, attendedData, RSVPData]) => {
        if (deleteData.deletedCount === 0)
          return callback(
            sendPacket(0, `Webinar doesn't exist or user isn't the host`)
          );

        callback(sendPacket(1, 'Successfully deleted event'));
      }
    );
  } catch (err) {
    log('error', err);
    callback(sendPacket(-1, err));
  }
}

export async function getWebinarDetails(
  userID: ObjectIdType,
  webinarID: ObjectIdType,
  callback: (packet: packetParams) => void
) {
  Webinar.model.findById(
    webinarID,
    [
      'title',
      'brief_description',
      'full_description',
      'host',
      'hostCommunity',
      'speakers',
      'dateTime',
      'conversation',
      'muxPlaybackID',
      'muxAssetPlaybackID',
      'eventImage',
      'eventBanner',
    ],
    {},
    async (err, webinar) => {
      if (err) {
        log('error', err.message);
        return callback(sendPacket(-1, 'There was an error finding webinar'));
      } else if (!webinar || webinar === undefined || webinar == null) {
        return callback(sendPacket(0, 'No webinar exists with this ID'));
      }

      let webinarObj = webinar.toObject();
      const eventImagePromise = retrieveSignedUrl(
        'images',
        'eventImage',
        webinarObj.eventImage
      );
      const eventBannerPromise = retrieveSignedUrl(
        'images',
        'eventBanner',
        webinarObj.eventBanner
      );
      Promise.all([eventImagePromise, eventBannerPromise]).then(
        ([eventImage, eventBanner]) => {
          webinarObj.eventImage = eventImage || undefined;
          webinarObj.eventBanner = eventBanner || undefined;

          return callback(
            sendPacket(1, 'Succesfully found webinar details', {
              webinar: webinarObj,
            })
          );
        }
      );
    }
  );
}

export function updateRSVP(
  userID: ObjectIdType,
  webinarID: ObjectIdType,
  didRSVP: boolean,
  callback: (packet: packetParams) => void
) {
  canUpdateRSVP(userID, webinarID, (packet) => {
    if (packet.success !== 1) return callback(packet);

    User.model.findById(userID, ['RSVPWebinars'], {}, (err, user) => {
      if (err) return callback(sendPacket(-1, err.message));
      if (!user)
        return callback(
          sendPacket(-1, 'Could not find user to RSVP to the webinar')
        );

      user.RSVPWebinars = user.RSVPWebinars as ObjectIdType[];
      const alreadyRSVPUser = user.RSVPWebinars.includes(webinarID);

      if (didRSVP && !alreadyRSVPUser) user.RSVPWebinars.push(webinarID);
      else if (!didRSVP && alreadyRSVPUser)
        user.RSVPWebinars.splice(user.RSVPWebinars.indexOf(webinarID), 1);

      user.save((err, user) => {
        if (err) return callback(sendPacket(-1, err.message));
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

function canUpdateRSVP(
  userID: ObjectIdType,
  webinarID: ObjectIdType,
  callback: (packet: packetParams) => void
) {
  Webinar.model.findById(webinarID, ['host', 'speakers'], {}, (err, webinar) => {
    if (err) return callback(sendPacket(-1, err.message));
    if (!webinar) return callback(sendPacket(0, "Webinar doesn't exist"));

    if (
      (webinar.speakers as ObjectIdType[]).includes(userID) ||
      userID === (webinar.host as ObjectIdType)
    )
      return callback(sendPacket(0, 'User cannot update RSVP'));

    return callback(sendPacket(1, 'User can update RSVP'));
  });
}

export async function addEventImage(eventID: ObjectIdType, image: string) {
  if (image === undefined) return sendPacket(1, 'No image was provided');

  if (image === '') {
    const remove = await Webinar.model.updateOne(
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
  const success = await uploadFile(
    'images',
    'eventImage',
    imageName,
    imageBuffer.data
  );
  if (!success) return sendPacket(-1, 'Could not upload event image');

  const upload = await Webinar.model.updateOne(
    { _id: eventID },
    { eventImage: imageName }
  );
  if (upload.nModified !== 1) return sendPacket(-1, 'Failed to add image to event');
  return sendPacket(1, 'Successfully uploaded event image');
}

export async function addEventBanner(eventID: ObjectIdType, image: string) {
  if (image === undefined) return sendPacket(1, 'No image was provided');

  if (image === '') {
    const remove = await Webinar.model.updateOne(
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
  const success = await uploadFile(
    'images',
    'eventBanner',
    imageName,
    imageBuffer.data
  );
  if (!success) return sendPacket(-1, 'Could not upload event banner');

  const upload = await Webinar.model.updateOne(
    { _id: eventID },
    { eventBanner: imageName }
  );
  if (upload.nModified !== 1) return sendPacket(-1, 'Failed to add banner to event');
  return sendPacket(1, 'Successfully uploaded event banner');
}

function addEventImagesAll(
  events: IWebinar[],
  imageReason: 'eventImage' | 'eventBanner'
) {
  const imagePromises = [];

  for (let i = 0; i < events.length; i++) {
    if (events[i][imageReason]) {
      try {
        const signedImageURLPromise = retrieveSignedUrl(
          'images',
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
      return undefined;
    });
}

function formatSpeakers(speakers: any[], host: any) {
  if (speakers.includes(host)) return speakers;
  else return speakers.concat(host);
}

export function sendEventEmailConfirmation(
  webinarData: { [key: string]: any },
  speakerEmails: string[],
  callback?: (packet: packetParams) => void
) {
  if (!webinarData || speakerEmails.length === 0)
    return callback && callback(sendPacket(0, 'Invalid inputs'));

  const eventDateTime = new Date(webinarData['dateTime']);
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
  )} at ${formatTime(eventDateTime)} PT<b></p>
  <p style={{fontSize: 14, fontFamily: 'Arial'}}>You can visit the page at https://www.rootshare.io/event/${
    webinarData['_id']
  }</p>

  <p style={{fontSize: 14, fontFamily: 'Arial'}}>See you there!</p>
  <p style={{fontSize: 14, fontFamily: 'Arial'}}>-The RootShare Team</p>

  `;

  var params = {
    Destination: {
      ToAddresses: speakerEmails,
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
      if (callback) callback(sendPacket(1, 'Successfully sent all emails'));
    })
    .catch((err) => {
      log('email error', err);
      if (callback)
        callback(sendPacket(-1, 'There was an error sending the emails'));
    });
}
