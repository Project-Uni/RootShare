import sendPacket from '../helpers/sendPacket';
import { isAuthenticatedWithJWT } from '../passport/middleware/isAuthenticated';
import { User } from '../models';

const aws = require('aws-sdk');
aws.config.loadFromPath('../keys/aws_key.json');
let ses = new aws.SES({
  apiVersion: '2010-12-01',
});

import log from '../helpers/logger';

const { getUserData } = require('../interactions/utilities');

module.exports = (app) => {
  app.get('/api/adminCount', isAuthenticatedWithJWT, (req, res) => {
    getUserData((packet) => {
      res.json(packet);
    });
  });
};

async function phasedEmergencyEmailRollout(message) {
  const users = await User.find({}, ['email']).exec();
  var i;
  for (i = 0; i < users.length - (users.length % 25); i += 25) {
    for (let j = i; j < i + 25; j++) {
      const email = users[j].email;
      sendEmail(email, message);
    }
    await sleep(2);
  }
  if (i < users.length) {
    for (i; i < users.length; i++) {
      const email = users[i].email;
      sendEmail(email, message);
    }
  }
  return true;
}

function sleep(seconds: number) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

function sendEmail(email, message) {
  var params = {
    Destination: {
      ToAddresses: [email],
    },
    Source: `RootShare Team <dev@rootshare.io>`,
    ReplyToAddresses: [],
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: message,
        },
      },
      Subject: {
        Data: `Don't miss tonight's Baby Boiler 2-hour event! (details inside)`,
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
      log('error', `${email}: ${err}`);
    });
}
