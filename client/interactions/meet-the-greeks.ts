import {
  decodeBase64Image,
  log,
  sendPacket,
  uploadFile,
} from '../helpers/functions';
import { MeetTheGreekEvent, Conversation, User } from '../models';

import { sendEventEmailConfirmation } from './streaming/event';
import { addProfilePicturesAll } from './utilities';

export async function createMTGEvent(
  communityID: string,
  description: string,
  introVideoURL: string,
  eventTime: string,
  speakers: string[]
) {
  if (speakers.length < 1) return sendPacket(-1, 'Atleast one speaker is required');

  try {
    const conversation = await new Conversation({
      participants: [],
    }).save();

    try {
      const event = await new MeetTheGreekEvent({
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

      const users = await User.find({ _id: { $in: speakers } }, ['email']).exec();
      const emails = users.map((user) => user.email);

      sendEventEmailConfirmation(event, emails);
      return sendPacket(1, 'Successfully created MTG event', { event });
    } catch (err) {
      log('error', err.message);
      return sendPacket(-1, 'Failed to create MTG Event', { error: err.message });
    }
  } catch (err) {
    log('error', err.message);
    return sendPacket(-1, 'Failed to create conversation', { error: err.message });
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
    return -1;
  }
}

export async function retrieveMTGEventInfo(communityID: string) {
  try {
    const mtgEvent = await MeetTheGreekEvent.findOne({ community: communityID }, [
      'title description introVideoURL speakers host dateTime eventBanner',
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

    //Add profile pictures

    const { speakers } = mtgEvent;
    mtgEvent.speakers = await addProfilePicturesAll(speakers, 'profile');

    return sendPacket(1, 'Successfully retrieved MTG event information', {
      mtgEvent,
    });
    // const users = await addProfilePicturesAll(members, 'profile');
    // addProfilePicturesAll()
  } catch (err) {
    log('error', err.message);
    return sendPacket(-1, err.message);
  }
}
