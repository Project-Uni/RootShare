import { Types } from 'mongoose';

import { Webinar, Conversation, User, IUser } from '../../rootshare_db/models';
import { packetParams } from '../../rootshare_db/types';
import {
  log,
  sendPacket,
  formatTime,
  formatDate,
  sendEmail,
} from '../../helpers/functions';
import { addEventImagesAll } from '../streaming/event';

type ObjectIdType = Types.ObjectId;

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

export async function sendEventEmailConfirmation(
  webinarData: { [key: string]: any },
  speakerEmails: string[],
  callback?: (packet: packetParams) => void
) {
  if (!webinarData || speakerEmails.length === 0)
    return callback && callback(sendPacket(0, 'Invalid inputs'));

  const subject = 'RootShare Virtual Event Speaking Invite';
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

  const response = await sendEmail(speakerEmails, subject, body);
  if (callback)
    if (response.success) callback(sendPacket(1, 'Successfully sent all emails'));
    else callback(sendPacket(-1, 'There was an error sending the emails'));
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

  //TODO - Fix typing issue with this db command
  const webinarPromise = (Webinar.model as any)
    .updateOne({ _id: webinarID }, { $pull: { RSVPs: oldSpeakers } })
    .exec();
  const userPromise = (User.model as any)
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

function formatSpeakers(speakers: any[], host: any) {
  if (speakers.includes(host)) return speakers;
  else return speakers.concat(host);
}
