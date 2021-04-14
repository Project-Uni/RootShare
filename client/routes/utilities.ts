import aws = require('aws-sdk');

import { User } from '../rootshare_db/models';
import { log, sendPacket, getQueryParams, sendSMS } from '../helpers/functions';
import { getViewersForEvents } from '../helpers/data_aggregation/getViewersForEvents';
import {
  getTotalMTGViewers,
  getUniqueInterested,
} from '../helpers/data_aggregation/getMTGUniqueUserInfo';
import { getUserGrowthByPeriod } from '../helpers/data_aggregation/getUserGrowthByPeriod';
import { isAuthenticatedWithJWT } from '../passport/middleware/isAuthenticated';
import { getUserData } from '../interactions/utilities';

const AWSKeys = require('../../keys/aws_key.json');

const ses = new aws.SES({
  accessKeyId: AWSKeys.ses.accessKeyId,
  secretAccessKey: AWSKeys.ses.secretAccessKey,
  region: AWSKeys.ses.region,
  apiVersion: '2010-12-01',
  signatureVersion: 'v4',
});

export default function utilityRoutes(app) {
  app.get('/api/adminCount', isAuthenticatedWithJWT, (req, res) => {
    getUserData((packet) => {
      res.json(packet);
    });
  });

  app.get('/api/utilities/mtg/interested', async (req, res) => {
    // const data = await getUniqueInterested();
    // return res.json(
    //   sendPacket(1, 'Retrieved Data', {
    //     users: data,
    //     count: Object.keys(data).length,
    //   })
    // );
    res.status(401).send('Re-activate this route if you want this data');
  });

  app.get('/api/utilities/mtg/viewers', async (req, res) => {
    // const data = await getTotalMTGViewers();
    // return res.json(
    //   sendPacket(1, 'Retrieved Viewers:', { viewers: data, length: data.length })
    // );
    res.status(401).send('Re-activate this route if you want this data');
  });

  app.get('/api/utilities/events/viewers', async (req, res) => {
    // const eventsCSV = await getViewersForEvents(['6058db7add0bb42382a5dd37']);
    // if (eventsCSV) {
    //   res.attachment('events_aggregation.csv');
    //   res.status(200).send(eventsCSV);
    // } else {
    //   res.status(500).send('Failed to retrieve information and convert to CSV');
    // }
    res.status(401).send('Re-activate this route if you want this data');
  });

  app.get('/api/utilities/growth', async (req, res) => {
    // const query = getQueryParams<{period: string}>(req, { period: { type: 'string' } });
    // if (!query) return res.status(500).send('Invalid query');
    // const growthCSV = await getUserGrowthByPeriod('month');
    // if (growthCSV) {
    //   res.attachment('user_growth.csv');
    //   res.status(200).send(growthCSV);
    // } else res.status(401).send('Failure');
    res.status(401).send('Re-activate this route if you want this data');
  });

  //NOTE - Keep this for now, and update text if we need it for upcoming events, so we don't have to randomly write up and format an email 20 minutes before the event
  app.get('/api/utilities/emergency/email', async (req, res) => {
    // const subject = `RootShare Presents: Chris Kramer All-Access`;
    // const message = `
    //   <h3>The Purdue Days, Basketball, and What Comes Next</h3>
    //   <h4>Join us today, September 4th, at 7pm EST to get the inside scoop from one of Purdue's top basketball players in history. Hear from Chris Kramer on how he juggled academics, athletics and his faith on his journey to success.</h4>
    //   <h3>Special Hosts: Chris Hartley & Robbie Hummel</h3>
    //   <p>Kramer will be joined by former Boiler Ball players Chris Hartley
    //   and Robbie Hummel for a night you won't want to miss!</p>
    //   <p><b>Log into your Rootshare account to access the Live Event <a href='https://rootshare.io/event/5f502ef670f5ff2eaa1f8e9a'>here</a></b></p>
    //   <p>Or visit https://rootshare.io/event/5f502ef670f5ff2eaa1f8e9a.</p>

    //   <p>Thanks!</p>
    //   <p><b>The RootShare Team</b></p>
    // `;
    // const response = await phasedEmergencyEmailRollout(subject, message);
    // return res.send(response);
    res.status(401).send('Re-activate this route if you want this data');
  });

  app.get('/api/utilies/sms', async (req, res) => {
    // const users = await User.find({
    //   $and: [{ phoneNumber: { $exists: true } }, { phoneNumber: { $ne: '' } }],
    // }).exec();
    // const phoneNumbers = users.map((u) => u.phoneNumber);

    // sendSMS(
    //   phoneNumbers,
    //   'Hey it’s Chris Hartley, CEO of 🌱RootShare! I wanted to remind you that we are hosting an EXCLUSIVE event with Northwestern Mutual for Purdue students and alumni TONIGHT! Tune with your Rootshare account using the link below. \n\nhttps://RootShare.io/event/6058db7add0bb42382a5dd37',
    //   'https://rootshare-profile-images.s3.us-east-2.amazonaws.com/images/messaging/nwm_Graphic.png'
    // );

    // return res.json(
    //   sendPacket(1, 'Users', {
    //     phoneNumbers,
    //   })
    // );
    res.status(401).send('This is an example usage route');
  });
}

export async function phasedEmergencyEmailRollout(subject: string, message: string) {
  const users = await User.model.find({}, ['email']).exec();
  for (let i = 0; i < users.length; i++) {
    const email = users[i].email;
    try {
      sendEmail(email, subject, message);
    } catch (err) {
      log('error', err);
    }
    if (i % 25 === 0) {
      log('info', `Sent batch ${Math.ceil(i / 25)} of emergency emails`);
      await sleep(2);
    }
  }
  log('info', `Successfully sent email ${subject} to all users`);
  return true;
}

function sleep(seconds: number) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

function sendEmail(email, subject, message) {
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
        Data: subject,
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
