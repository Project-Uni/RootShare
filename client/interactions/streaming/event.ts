const mongoose = require('mongoose');
const Webinar = mongoose.model('webinars');
const User = mongoose.model('users');

import log from '../../helpers/logger';
import sendPacket from '../../helpers/sendPacket';

export async function createEvent(
  eventBody: { [key: string]: any },
  user: { [key: string]: any },
  callback: (packet: any) => void
) {
  const newWebinar = new Webinar({
    title: eventBody['title'],
    brief_description: eventBody['brief_description'],
    full_description: eventBody['full_description'],
    host: eventBody['host'],
    speakers: eventBody['speakers'],
    date: eventBody['date'],
    time: eventBody['time'],
  });

  newWebinar.save((err) => {
    if (err) return callback(sendPacket(0, 'Failed to create webinar'));
    callback(sendPacket(1, 'Successfully created webinar', newWebinar));
  });
}
