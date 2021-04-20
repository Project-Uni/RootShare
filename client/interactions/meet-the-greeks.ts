const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

import {
  Conversation,
  User,
  Community,
  MeetTheGreekInterest,
  ExternalCommunication,
  Webinar,
} from '../rootshare_db/models';
import { packetParams, ObjectIdType } from '../rootshare_db/types';
import {
  decodeBase64Image,
  log,
  retrieveSignedUrl,
  sendPacket,
  uploadFile,
  sendSMS,
  sendEmail,
} from '../helpers/functions';

import { addProfilePicturesAll } from './utilities';

dayjs.extend(utc);
dayjs.extend(timezone);

export async function createScaleEvent(
  communityID: ObjectIdType,
  description: string,
  speakers: ObjectIdType[],
  scaleEventType: string,
  introVideoURL?: string
  // eventTime: string,
) {
  if (speakers.length < 1) return sendPacket(-1, 'At least one speaker is required');

  try {
    let event = await Webinar.model
      .findOne({
        hostCommunity: communityID,
        scaleEventType,
      })
      .exec();

    try {
      if (event) {
        //Edit Mode
        event.full_description = description;
        event.introVideoURL = introVideoURL;
        // event.dateTime = eventTime;
        event.dateTime = new Date('Apr 23 2021 12:00 PM EDT');
        event.speakers = speakers;
        event.host = speakers[0];
        // event.isDev = process.env.NODE_ENV === 'dev';
        await event.save();
      }
      //Creating new event
      else {
        const conversation = await new Conversation.model({
          participants: [],
        }).save();

        event = await new Webinar.model({
          // title: 'TBD',
          hostCommunity: communityID,
          full_description: description,
          introVideoURL,
          // dateTime: eventTime,
          dateTime: new Date('Apr 23 2021 12:00 PM EDT'),
          host: speakers[0],
          speakers: speakers,
          conversation: conversation._id,
          scaleEventType,
          isDev: process.env.NODE_ENV === 'dev',
        }).save();
      }

      const users = await User.model
        .find({ _id: { $in: speakers } }, ['email', 'firstName', 'lastName'])
        .exec();

      sendMTGEventEmails(
        users,
        event as {
          _id: ObjectIdType;
          hostCommunity: ObjectIdType;
          dateTime: Date;
          full_description: string;
        }
      );
      return sendPacket(1, 'Successfully updated MTG event', { event });
    } catch (err) {
      log('error', err.message);
      return sendPacket(-1, 'There was an error updating the event', {
        error: err.message,
      });
    }
  } catch (err) {
    log('error', err.message);
    return sendPacket(-1, 'There was an error trying to find the current event', {
      err,
    });
  }
}

export async function uploadMTGBanner(
  communityID: ObjectIdType,
  image: string,
  scaleEventType: string
) {
  try {
    const imageBuffer: { type?: string; data?: Buffer } = decodeBase64Image(image);
    if (!imageBuffer.data) return -1;

    const fileName = `${communityID}_mtg_banner.jpeg`;

    const success = await uploadFile(
      'images',
      'mtgBanner',
      fileName,
      imageBuffer.data
    );
    if (!success) return sendPacket(-1, 'There was an error uploading the image');

    await Webinar.model
      .updateOne(
        { hostCommunity: communityID, scaleEventType },
        { eventImage: fileName }
      )
      .sort({
        updatedAt: -1,
      })
      .exec();

    return sendPacket(1, 'Successfully uploaded image', { fileName });
  } catch (err) {
    log('error', err);
    return sendPacket(-1, err.message);
  }
}

export async function retrieveMTGEventInfo(
  communityID: ObjectIdType,
  scaleEventType: string
) {
  try {
    const mtgEvent = await Webinar.model
      .findOne({ hostCommunity: communityID, scaleEventType }, [
        'title',
        'full_description',
        'introVideoURL',
        'speakers',
        'host',
        'dateTime',
        'eventImage',
      ])
      .populate({
        path: 'speakers',
        select: 'firstName lastName email _id profilePicture',
      })
      .lean()
      .exec();

    if (!mtgEvent)
      return sendPacket(
        0,
        `Could not find corresponding scale event. Most likely doesn't exist`
      );

    const { speakers } = mtgEvent;
    mtgEvent.speakers = await addProfilePicturesAll(speakers, 'profile');
    mtgEvent.eventImage =
      (await retrieveSignedUrl('images', 'mtgBanner', mtgEvent.eventImage)) || '';

    let cleanedData = Object.assign({}, mtgEvent, {
      description: mtgEvent.full_description,
    });
    delete cleanedData.full_description;

    return sendPacket(1, 'Successfully retrieved scale event information', {
      mtgEvent: cleanedData,
    });
  } catch (err) {
    log('error', err.message);
    return sendPacket(-1, err.message);
  }
}

export async function sendMTGCommunications(
  userID: ObjectIdType,
  communityID: ObjectIdType,
  mode: 'text' | 'email',
  message: string
) {
  try {
    const community = await Community.model
      .findOne({ _id: communityID }, ['name'])
      .exec();
    if (!community) return sendPacket(0, 'Could not find community');

    await new ExternalCommunication.model({
      mode,
      message,
      community: communityID,
      user: userID,
    }).save();

    const selection = mode === 'text' ? 'phoneNumber' : 'email';

    const interestedUsers = (
      await MeetTheGreekInterest.model
        .find({
          community: communityID,
        })
        .populate({ path: 'user', select: [selection] })
        .exec()
    ).map((interestedResponse) => interestedResponse.user[selection]);

    if (mode === 'email') {
      interestedUsers.forEach((email) =>
        sendEmail([email], `A Message From ${community.name}`, message)
      );
    } else {
      sendSMS(interestedUsers, `Message from ${community.name}`);
      sendSMS(interestedUsers, message);
    }
    return sendPacket(1, `Successfully sent ${mode}`);
  } catch (err) {
    log('error', err.message);
    return sendPacket(-1, err.message);
  }
}

export async function updateUserInfo(
  userID: ObjectIdType,
  userInfo: any,
  callback: (packet: packetParams) => void
) {
  try {
    let updateObj = {};
    if (userInfo.firstName) updateObj['firstName'] = userInfo.firstName;
    if (userInfo.lastName) updateObj['lastName'] = userInfo.lastName;
    if (userInfo.major) updateObj['major'] = userInfo.major;
    if (userInfo.graduationYear)
      updateObj['graduationYear'] = userInfo.graduationYear;
    if (userInfo.phoneNumber) updateObj['phoneNumber'] = userInfo.phoneNumber;
    if (userInfo.interests) updateObj['interests'] = userInfo.interests;

    const userUpdate = await User.model
      .updateOne({ _id: userID }, { $set: updateObj })
      .exec();

    if (userUpdate.nModified !== 1)
      return callback(sendPacket(-1, 'Failed to update user information'));

    return callback(sendPacket(1, 'Successfully updated User information.'));
  } catch (err) {
    log('error', err.message);
    return callback(sendPacket(-1, err.message));
  }
}

export async function getInterestAnswers(
  userID: ObjectIdType,
  communityID: ObjectIdType
) {
  try {
    // Checks first for matching interest to update or get latest interest submitted by User
    let interest =
      (await MeetTheGreekInterest.model.findOne(
        { user: userID, community: communityID },
        ['answers']
      )) ||
      (await MeetTheGreekInterest.model.findOne({ user: userID }, ['answers']).sort({
        updatedAt: -1,
      }));

    let answers;
    try {
      answers = interest ? JSON.parse(interest.answers) : {};
    } catch (err) {
      answers = {};
    }
    return sendPacket(1, 'Sending Interest', { answers });
  } catch (err) {
    log('error', err.message);
    return sendPacket(-1, err.message);
  }
}

export async function updateInterestAnswers(
  userID: ObjectIdType,
  communityID: ObjectIdType,
  answers: string
) {
  try {
    const userPromise = User.model.exists({ _id: userID });
    const communityPromise = Community.model.exists({ _id: communityID });

    return Promise.all([userPromise, communityPromise]).then(
      async ([userExists, communityExists]) => {
        if (!userExists) return sendPacket(0, `User doesn't exist`);
        if (!communityExists) return sendPacket(0, `Community doesn't exist`);

        await MeetTheGreekInterest.model
          .updateOne(
            { user: userID, community: communityID },
            { $set: { answers } },
            { upsert: true }
          )
          .exec();

        return sendPacket(1, 'Updated Interest for Community');
      }
    );
  } catch (err) {
    log('error', err.message);
    return sendPacket(-1, err.message);
  }
}
export async function getMTGEvents(scaleEventType: string) {
  const condition = Object.assign(
    { scaleEventType },
    process.env.NODE_ENV === 'dev' ? {} : { isDev: { $ne: true } }
  );

  try {
    const events = await Webinar.model
      .aggregate([
        { $match: condition },
        {
          $lookup: {
            from: 'communities',
            localField: 'hostCommunity',
            foreignField: '_id',
            as: 'community',
          },
        },
        { $unwind: '$community' },
        {
          $project: {
            _id: '$_id',
            description: '$full_description',
            dateTime: '$dateTime',
            community: {
              _id: '$community._id',
              name: '$community.name',
              profilePicture: '$community.profilePicture',
            },
            introVideoURL: '$introVideoURL',
            eventImage: '$eventImage',
          },
        },
      ])
      .exec();

    const imagePromises = [];
    for (let i = 0; i < events.length; i++) {
      imagePromises.push(
        retrieveSignedUrl('images', 'mtgBanner', events[i].eventImage)
      );
      imagePromises.push(
        retrieveSignedUrl(
          'images',
          'communityProfile',
          events[i].community.profilePicture
        )
      );
    }

    return Promise.all(imagePromises).then((images) => {
      for (let i = 0; i < images.length; i += 2) {
        events[Math.floor(i / 2)].eventImage = images[i];
        events[Math.floor(i / 2)].community.profilePicture = images[i + 1];
      }
      return sendPacket(1, 'Successfully retrieved all meet the greeks events', {
        events,
      });
    });
  } catch (err) {
    log('error', err.message);
    return sendPacket(-1, err.message);
  }
}

export async function getInterestedUsers(communityID: ObjectIdType) {
  try {
    const interestedUsers = await MeetTheGreekInterest.model
      .find({ community: communityID }, ['answers', 'user'])
      .populate({
        path: 'user',
        select:
          'firstName lastName email phoneNumber profilePicture major graduationYear interests',
      })
      .lean()
      .exec();

    const reshapedData = interestedUsers.map((interestResponse) => ({
      ...interestResponse.user,
      answers: interestResponse.answers,
    }));

    await addProfilePicturesAll(reshapedData, 'profile');

    return sendPacket(1, 'Successfully retrieved all interested users', {
      users: reshapedData,
    });
  } catch (err) {
    log('error', err);
    return sendPacket(-1, err.message);
  }
}

async function sendMTGEventEmails(
  recipients: {
    firstName: string;
    lastName: string;
    email: string;
    _id: ObjectIdType;
  }[],
  event: {
    _id: ObjectIdType;
    hostCommunity: ObjectIdType;
    dateTime: Date;
    full_description: string;
  }
) {
  try {
    const community = await Community.model
      .findById(event.hostCommunity, ['name', 'scaleEventType'])
      .exec();
    const timestamp = convertEST(event.dateTime);
    const scaleEventType = community.scaleEventType;
    let eventName = '';
    switch (scaleEventType) {
      case 'mtg': {
        eventName = 'Meet The Greek ';
        break;
      }
      case 'grand-prix': {
        eventName = 'Grand Prix ';
        break;
      }
    }
    recipients.forEach((recipient) => {
      sendEmail(
        [recipient.email],
        `${eventName}Event Invite From ${community.name}`,
        `
        <p>Hi ${recipient.firstName},</p>
        <p></p>
        <p>You have been invited by <strong>${community.name}</strong> to speak at their ${eventName}event on <strong>${timestamp} EST</strong>.</p>
        <p></p>
        <p>You can access the event by visiting:</p>
        <p><a href="https://rootshare.io/event/${event._id}" target="_blank">https://rootshare.io/event/${event._id}</a></p>
        <p></p>
        <p>Thanks for using RootShare, and have a great event!</p>
        <p>- The RootShare team.</p>
        `
      );
    });

    return true;
  } catch (err) {
    log('error', err);
    return false;
  }
}

const convertEST = (timestamp: Date | string) => {
  return dayjs.tz(timestamp, 'America/New_York').format('dddd MMMM D @ h:mm A');
};
