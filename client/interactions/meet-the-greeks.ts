import {
  decodeBase64Image,
  log,
  retrieveSignedUrl,
  sendPacket,
  uploadFile,
} from '../helpers/functions';
import { sendSMS } from '../helpers/functions/twilio';
import {
  MeetTheGreekEvent,
  Conversation,
  User,
  Community,
  MeetTheGreekInterest,
  ExternalCommunication,
} from '../models';

import { sendEventEmailConfirmation } from './streaming/event';
import { addProfilePicturesAll } from './utilities';

import sendEmail from '../helpers/functions/sendEmail';

const aws = require('aws-sdk');
aws.config.loadFromPath('../keys/aws_key.json');
let ses = new aws.SES({
  apiVersion: '2010-12-01',
});

export async function createMTGEvent(
  communityID: string,
  description: string,
  introVideoURL: string,
  eventTime: string,
  speakers: string[]
) {
  if (speakers.length < 1) return sendPacket(-1, 'At least one speaker is required');

  try {
    let event = await MeetTheGreekEvent.findOne({
      community: communityID,
    }).exec();

    try {
      if (event) {
        //Edit Mode
        event.description = description;
        event.introVideoURL = introVideoURL;
        event.dateTime = eventTime;
        event.speakers = speakers;
        event.host = speakers[0];
        event.isDev = process.env.NODE_ENV === 'dev';
        await event.save();
      }
      //Creating new event
      else {
        const conversation = await new Conversation({
          participants: [],
        }).save();

        event = await new MeetTheGreekEvent({
          // title: 'TBD',
          community: communityID,
          description,
          introVideoURL,
          dateTime: eventTime,
          host: speakers[0],
          speakers: speakers,
          conversation: conversation._id,
          isDev: process.env.NODE_ENV === 'dev',
        }).save();
      }

      const users = await User.find({ _id: { $in: speakers } }, ['email']).exec();
      const emails = users.map((user) => user.email);

      sendEventEmailConfirmation(event, emails);
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

export async function uploadMTGBanner(communityID: string, image: string) {
  try {
    const imageBuffer: { type?: string; data?: Buffer } = decodeBase64Image(image);
    if (!imageBuffer.data) return -1;

    const fileName = `${communityID}_mtg_banner.jpeg`;

    const success = await uploadFile('mtgBanner', fileName, imageBuffer.data);
    if (!success) return sendPacket(-1, 'There was an error uploading the image');

    await MeetTheGreekEvent.updateOne(
      { community: communityID },
      { eventBanner: fileName }
    ).exec();

    return sendPacket(1, 'Successfully uploaded image', { fileName });
  } catch (err) {
    log('error', err);
    return sendPacket(-1, err.message);
  }
}

export async function retrieveMTGEventInfo(communityID: string) {
  try {
    const mtgEvent = await MeetTheGreekEvent.findOne({ community: communityID }, [
      'title',
      'description',
      'introVideoURL',
      'speakers',
      'host',
      'dateTime',
      'eventBanner',
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
        'Could not find corresponding mtg event. Most likely doesnt exist'
      );

    const { speakers } = mtgEvent;
    mtgEvent.speakers = await addProfilePicturesAll(speakers, 'profile');
    mtgEvent.eventBanner = await retrieveSignedUrl(
      'mtgBanner',
      mtgEvent.eventBanner
    );

    return sendPacket(1, 'Successfully retrieved MTG event information', {
      mtgEvent,
    });
  } catch (err) {
    log('error', err.message);
    return sendPacket(-1, err.message);
  }
}

export async function sendMTGCommunications(
  userID: string,
  communityID: string,
  mode: 'text' | 'email',
  message: string
) {
  try {
    const community = await Community.findOne({ _id: communityID }, ['name']).exec();
    if (!community) return sendPacket(0, 'Could not find community');

    await new ExternalCommunication({
      mode,
      message,
      community: communityID,
      user: userID,
    }).save();

    const selection = mode === 'text' ? 'phoneNumber' : 'email';

    const interestedUsers = (
      await MeetTheGreekInterest.find({
        community: communityID,
      })
        .populate({ path: 'user', select: [selection] })
        .exec()
    ).map((interestedResponse) => interestedResponse.user[selection]);

    if (mode === 'email') {
      interestedUsers.forEach((email) =>
        sendEmail(email, `A Message From ${community.name}`, message)
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

export async function updateUserInfo(userID, userInfo, callback) {
  try {
    let updateObj = {};
    if (userInfo.firstName) updateObj['firstName'] = userInfo.firstName;
    if (userInfo.lastName) updateObj['lastName'] = userInfo.lastName;
    if (userInfo.major) updateObj['major'] = userInfo.major;
    if (userInfo.graduationYear)
      updateObj['graduationYear'] = userInfo.graduationYear;
    if (userInfo.phoneNumber) updateObj['phoneNumber'] = userInfo.phoneNumber;
    if (userInfo.interests) updateObj['interests'] = userInfo.interests;

    const userUpdate = await User.updateOne(
      { _id: userID },
      { $set: updateObj }
    ).exec();

    if (userUpdate.nModified !== 1)
      return callback(sendPacket(-1, 'Failed to update user information'));

    return callback(sendPacket(1, 'Successfully updated User information.'));
  } catch (err) {
    log('error', err.message);
    return callback(sendPacket(-1, err.message));
  }
}

export async function getInterestAnswers(userID: string, communityID: string) {
  try {
    // Checks first for matching interest to update or get latest interest submitted by User
    let interest =
      (await MeetTheGreekInterest.findOne({ user: userID, community: communityID }, [
        'answers',
      ])) ||
      (await MeetTheGreekInterest.findOne({ user: userID }, ['answers']).sort({
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
  userID: string,
  communityID: string,
  answers: string
) {
  try {
    const userPromise = User.exists({ _id: userID });
    const communityPromise = Community.exists({ _id: communityID });

    return Promise.all([userPromise, communityPromise]).then(
      async ([userExists, communityExists]) => {
        if (!userExists) return sendPacket(0, `User doesn't exist`);
        if (!communityExists) return sendPacket(0, `Community doesn't exist`);

        await MeetTheGreekInterest.updateOne(
          { user: userID, community: communityID },
          { $set: { answers } },
          { upsert: true }
        ).exec();

        return sendPacket(1, 'Updated Interest for Community');
      }
    );
  } catch (err) {
    log('error', err.message);
    return sendPacket(-1, err.message);
  }
}
export async function getMTGEvents() {
  const condition = process.env.NODE_ENV === 'dev' ? {} : { isDev: { $ne: true } };

  try {
    const events = await MeetTheGreekEvent.find(condition, [
      'description',
      'introVideoURL',
      'dateTime',
      'community',
      'eventBanner',
    ])
      .populate({ path: 'community', select: 'name profilePicture' })
      .exec();

    const imagePromises = [];
    for (let i = 0; i < events.length; i++) {
      imagePromises.push(retrieveSignedUrl('mtgBanner', events[i].eventBanner));
      imagePromises.push(
        retrieveSignedUrl('communityProfile', events[i].community.profilePicture)
      );
    }

    return Promise.all(imagePromises).then((images) => {
      for (let i = 0; i < images.length; i += 2) {
        events[Math.floor(i / 2)].eventBanner = images[i];
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

export async function getInterestedUsers(communityID: string) {
  try {
    const interestedUsers = await MeetTheGreekInterest.find(
      { community: communityID },
      ['answers', 'user']
    )
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
