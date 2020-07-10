const mongoose = require('mongoose');
const Webinar = mongoose.model('webinars');
const User = mongoose.model('users');

const nodemailer = require('nodemailer');
import log from '../../helpers/logger';
import sendPacket from '../../helpers/sendPacket';
const { createNewOpenTokSession } = require('./opentok');

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

  newWebinar.save((err, webinar) => {
    if (err) return callback(sendPacket(0, 'Failed to create webinar'));
    const createdOpenTokSession = createNewOpenTokSession(webinar);
    if (createdOpenTokSession) {
      callback(sendPacket(1, 'Successfully created webinar', webinar));
      sendEventEmailConfirmation(
        webinar,
        eventBody['speakerEmails'],
        eventBody['hostEmail']
      );
    } else callback(sendPacket(1, 'Failed to create OpenTok Session'));
  });
}

//TODO - Replace this with a better email later on
//For guide, refer to https://blog.mailtrap.io/sending-emails-with-nodemailer/

function sendEventEmailConfirmation(
  webinarData: { [key: string]: any },
  speakerEmails: string[],
  hostEmail: string
) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: true,
    auth: {
      user: 'dhrdesai20@gmail.com',
      pass: 'fortMinor1',
    },
  });

  const body = `
  <p style={{fontSize: 14, fontFamily: 'Arial'}}>Hello! You have been invited to speak at an event on RootShare.</p>

  <p style={{fontSize: 14, fontFamily: 'Arial'}}><b>${webinarData['title']}<b></p>

  <p style={{fontSize: 14, fontFamily: 'Arial'}}>${webinarData['brief_description']}</p>

  <p style={{fontSize: 14, fontFamily: 'Arial'}}>${webinarData['full_description']}</p>

  <p style={{fontSize: 14, fontFamily: 'Arial'}}><b>On ${webinarData['date']} at ${webinarData['time']}<b></p>
  <p style={{fontSize: 14, fontFamily: 'Arial'}}>You can visit the page at https://www.rootshare.io/event/${webinarData['_id']}</p>

  <p style={{fontSize: 14, fontFamily: 'Arial'}}>See you there!</p>
  <p style={{fontSize: 14, fontFamily: 'Arial'}}>-The RootShare Team</p>

  `;
  const mailOptions = {
    from: 'dev@rootshare.io',
    to: [...speakerEmails, hostEmail],
    subject: 'RootShare Virtual Event Speaking Invite',
    html: body,
  };
  transporter.sendMail(mailOptions, function (err, info) {
    if (err) console.log(err);
    else console.log(info);
  });
}
