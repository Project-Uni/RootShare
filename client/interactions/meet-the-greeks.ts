import { log, sendPacket } from '../helpers/functions';
import { MeetTheGreekEvent, Conversation, User } from '../models';

import { sendEventEmailConfirmation } from './streaming/event';

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
