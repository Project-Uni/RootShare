import sendPacket from '../helpers/sendPacket';
import { User } from '../models';

const MOCK_LOGIN_EMAIL = 'mahesh2@purdue.edu';

const {
  sendLaunchEventInvitation,
} = require('../interactions/registration/email-confirmation');

const aws = require('aws-sdk');
aws.config.loadFromPath('../keys/aws_key.json');
let ses = new aws.SES({
  apiVersion: '2010-12-01',
});

import log from '../helpers/logger';

module.exports = (app) => {
  app.get('/api/mockLogin', async (req, res) => {
    if (process.env.NODE_ENV && process.env.NODE_ENV === 'dev') {
      const user = await User.findOne({ email: MOCK_LOGIN_EMAIL });
      if (!user || user === undefined || user === null)
        res.json(sendPacket(-1, 'Could not find user'));
      req.login(user, (err) => {
        if (err) return res.json(sendPacket(-1, 'Failed to login mock user'));
        return res.json(
          sendPacket(1, 'Successfully logged in to mock user', {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            _id: user._id,
          })
        );
      });
    } else return res.json(sendPacket(-1, 'Program not in dev'));
  });

  app.get('/testSendEmail', async (req, res) => {
    const users = await User.find({}, ['email']).exec();
    // const users = { length: 123 };
    // console.log('Length: ', users.length);
    // const users = [
    //   // { email: 'mahesh.ashwin1998@gmail.com,' },
    //   // { email: 'fergus90@purdue.edu' },
    //   // { email: 'smitdesai422@gmail.com' },
    //   // { email: 'chris.hartley@rootshare.io' },
    // ];
    var i;
    for (i = 0; i < users.length - (users.length % 25); i += 25) {
      for (let j = i; j < i + 25; j++) {
        const email = users[j].email;
        sendEventReminder(email);
      }
      await sleep(2);
    }
    if (i < users.length) {
      for (i; i < users.length; i++) {
        const email = users[i].email;
        sendEventReminder(email);
      }
    }

    // sendLaunchEventInvitation('fergus90@purdue.edu');
    // sendLaunchEventInvitation('mahesh2@purdue.edu');
    return res.send('Success');
  });
};

function sleep(seconds: number) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

function sendEventReminder(email: string) {
  const body = `
  <p>
    Hello Boilermakers!
  </p>

  <p>
    <b>We are humbled to have you and ready to start tonight at 7PM EST</b> 
    with legends Robbie, E'Twaun and JaJuan.
  </p>
  
  <p>
    <b> To access the event, you can either</b>:
  </p>

     <p>- use this event link <a href='https://www.rootshare.io/event/5f30b4488e8fb07262044e9f'>Rootshare Event Link</a>
     </p>
     <p>- OR login to the website <a href='https://www.rootshare.io'>Rootshare Homepage</a>.</p>
  
  <p></p>
  <p>
    Again, very special thank you to our sponsor: 
    <a href='https://www.purdueforlife.org'>
      The Purdue For Life Foundation
    </a>
  </p>

  <p>
    BOILER UP!
  </p>
  
  <p style={color: 'grey'}>
    Chris Hartley
  </p>
  <p style={color: 'grey'}>
    Founder, Rootshare
  </p>
  <p style={color: 'grey'}>
    Student Built. Alumni Led. Community Driven
  </p>

  `;

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
          Data: body,
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
