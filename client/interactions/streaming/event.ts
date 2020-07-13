const mongoose = require('mongoose');
const Webinar = mongoose.model('webinars');
const User = mongoose.model('users');

const aws = require('aws-sdk');
aws.config.loadFromPath('../keys/aws_key.json');

import log from '../../helpers/logger';
import sendPacket from '../../helpers/sendPacket';
const { createNewOpenTokSession } = require('./opentok');

let ses = new aws.SES({
  apiVersion: '2010-12-01',
});

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

export async function getWebinarDetails(webinarID, callback) {
  Webinar.findOne({ _id: webinarID }, (err, webinar) => {
    if (err) {
      log('error', err);
      return callback(sendPacket(-1, 'There was an error finding webinar'));
    } else if (!webinar) {
      return callback(sendPacket(0, 'No webinar exists with this ID'));
    }
    return callback(
      sendPacket(1, 'Succesfully found webinar details', { webinar: webinar })
    );
  });
}

function sendEventEmailConfirmation(
  webinarData: { [key: string]: any },
  speakerEmails: string[],
  hostEmail: string
) {
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