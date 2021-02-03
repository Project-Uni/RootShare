import { isAuthenticatedWithJWT } from '../passport/middleware/isAuthenticated';
import { MeetTheGreekInterest, User, Webinar } from '../models';

const aws = require('aws-sdk');
aws.config.loadFromPath('../keys/aws_key.json');
let ses = new aws.SES({
  apiVersion: '2010-12-01',
});

import { log, sendPacket } from '../helpers/functions';

import { getUserData } from '../interactions/utilities';
import { Request, Response } from 'express';
import { sendSMS } from '../helpers/functions/twilio';

module.exports = (app) => {
  app.get('/api/adminCount', isAuthenticatedWithJWT, (req, res) => {
    getUserData((packet) => {
      res.json(packet);
    });
  });

  app.get('/api/interested', async (req, res) => {
    const data = await getUniqueInterested();
    return res.json(
      sendPacket(1, 'Retrieved Data', {
        users: data,
        count: Object.keys(data).length,
      })
    );
  });

  app.get('/api/viewers', async (req, res) => {
    const data = await getTotalMTGViewers();
    return res.json(
      sendPacket(1, 'Retrieved Viewers:', { viewers: data, length: data.length })
    );
  });

  // app.get('/api/twilio', async (req: Request, res: Response) => {
  //   const data = await sendSMS(['(408) 644-9017'], 'RootShare SMS!');
  //   return res.json({ message: data });
  // });

  //NOTE - Keep this for now, and update text if we need it for upcoming events, so we don't have to randomly write up and format an email 20 minutes before the event
  // app.get('/api/emergency/dontUse/phasedEmail', async (req, res) => {
  //   const subject = `RootShare Presents: Chris Kramer All-Access`;
  //   const message = `
  //     <h3>The Purdue Days, Basketball, and What Comes Next</h3>
  //     <h4>Join us today, September 4th, at 7pm EST to get the inside scoop from one of Purdue's top basketball players in history. Hear from Chris Kramer on how he juggled academics, athletics and his faith on his journey to success.</h4>
  //     <h3>Special Hosts: Chris Hartley & Robbie Hummel</h3>
  //     <p>Kramer will be joined by former Boiler Ball players Chris Hartley
  //     and Robbie Hummel for a night you won't want to miss!</p>
  //     <p><b>Log into your Rootshare account to access the Live Event <a href='https://rootshare.io/event/5f502ef670f5ff2eaa1f8e9a'>here</a></b></p>
  //     <p>Or visit https://rootshare.io/event/5f502ef670f5ff2eaa1f8e9a.</p>

  //     <p>Thanks!</p>
  //     <p><b>The RootShare Team</b></p>
  //   `;
  //   const response = await phasedEmergencyEmailRollout(subject, message);
  //   return res.send(response);
  // });
};

export async function phasedEmergencyEmailRollout(subject: string, message: string) {
  const users = await User.find({}, ['email']).exec();
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

async function getUniqueInterested() {
  const data: any[] = await MeetTheGreekInterest.find({}, 'answers user')
    .populate({ path: 'user', select: 'firstName lastName email phoneNumber' })
    .exec();

  const reducedData = {};
  data.forEach((currentInterest) => {
    if (!(currentInterest.user._id in reducedData)) {
      reducedData[
        currentInterest.user._id
      ] = `${currentInterest.user.firstName} ${currentInterest.user.lastName}`;
    }
  });

  return reducedData;
}

async function getTotalMTGViewers() {
  const events = await Webinar.find({ isMTG: true, isDev: false }, 'attendees_V2')
    .populate({ path: 'attendees_V2', select: 'firstName lastName email _id' })
    .lean()
    .exec();

  const output = {};
  const chain = events
    .map((event) => event.attendees_V2)
    .forEach((event) => {
      if (event) {
        event.forEach((attendee) => {
          if (attendee._id && !(attendee._id in output)) {
            output[attendee._id] = {
              firstName: attendee.firstName,
              lastName: attendee.lastName,
            };
          }
        });
      }
    });

  // const first = events.map((event) => event.attendees_V2);
  // const output = {};
  // first.forEach((event) => {
  //   if (event) {
  //     event.forEach((attendee) => {
  //       if (attendee._id && !(attendee._id in output)) {
  //         output[attendee._id] = {
  //           firstName: attendee.firstName,
  //           lastName: attendee.lastName,
  //         };
  //       }
  //     });
  //   }
  // });

  const filteredOutput = Object.keys(output).map(
    (key) => `${output[key].firstName} ${output[key].lastName}`
  );
  return filteredOutput;
}
