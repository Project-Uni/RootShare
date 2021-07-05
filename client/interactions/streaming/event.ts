import { Webinar, User, IConnection, IWebinar } from '../../rootshare_db/models';
import { packetParams, ObjectIdVal, ObjectIdType } from '../../rootshare_db/types';
import {
  log,
  sendPacket,
  uploadFile,
  decodeBase64Image,
  retrieveSignedUrl,
} from '../../helpers/functions';

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
          { scaleEventType: undefined },
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

export async function getRecentEvents(limit: number) {
  try {
    const conditions = {
      $and: [
        { isDev: false },
        { scaleEventType: undefined },
        {
          $or: [
            { muxAssetPlaybackID: { $ne: undefined } },
            { dateTime: { $gte: new Date().getTime() - 240 * 60 * 1000 } },
          ],
        },
      ],
    };

    let events = await Webinar.model
      .aggregate([
        { $match: conditions },
        { $sort: { createdAt: -1 } },
        { $limit: limit },
        {
          $project: {
            title: '$title',
            brief_description: '$brief_description',
            full_description: 'full_description',
            dateTime: '$dateTime',
            hostCommunity: '$hostCommunity',
            eventImage: '$eventImage',
          },
        },
      ])
      .exec();

    if (!events) return sendPacket(-1, `Couldn't get recent events`);

    events = await addEventImagesAll(events, 'eventImage');

    return sendPacket(1, 'Successfully retrieved recent events', {
      events,
    });
  } catch (err) {
    log('error', err);
    return sendPacket(-1, err.message);
  }
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
      userID.equals(webinar.host as ObjectIdType)
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

export function addEventImagesAll(
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
