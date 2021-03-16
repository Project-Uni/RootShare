import { User } from '../../rootshare_db/models';

const aws = require('aws-sdk');
aws.config.loadFromPath('../keys/aws_key.json');
import {
  log,
  sendPacket,
  convertEmailToToken,
  convertTokenToEmail,
} from '../../helpers/functions';

let ses = new aws.SES({
  apiVersion: '2010-12-01',
});

export async function confirmUser(emailToken: string) {
  let emailAddress = convertTokenToEmail(emailToken);
  let currUser;
  try {
    currUser = await User.model.findOne({ email: emailAddress });
  } catch (error) {
    log('MONGO ERROR', error);
  }

  if (!currUser) {
    return null;
  }

  currUser.confirmed = true;
  await currUser.save();
  return currUser;
}

export async function unsubscribeUser(emailToken: string) {
  let emailAddress = convertTokenToEmail(emailToken);
  let currUser;
  try {
    currUser = await User.model.findOne({ email: emailAddress });
  } catch (error) {
    log('MONGO ERROR', error);
  }

  if (!currUser) {
    return null;
  }

  currUser.sendEmails = false;
  await currUser.save();
  return currUser;
}

export function resetLockAuth(
  emailToken: string,
  method: 'Reset' | 'Locked',
  provider: 'Google' | 'LinkedIn',
  callback
) {
  let emailAddress = convertTokenToEmail(emailToken);
  User.model.findOne({ email: emailAddress }, ['_id'], (err, user) => {
    if (err) return callback(sendPacket(-1, err));
    if (!user) return callback(sendPacket(0, 'Could not find User'));

    const field = provider === 'Google' ? 'googleID' : 'linkedinID';
    const newValue = method === 'Reset' ? undefined : '0';
    user[field] = newValue;

    user.save((err) => {
      if (err) return callback(sendPacket(-1, err));
      return callback(
        sendPacket(1, `Successfully ${method} ${provider} Registration`)
      );
    });
  });
}

export function sendConfirmationEmail(emailAddress: string) {
  const emailToken = convertEmailToToken(emailAddress);
  const confirmationLink = `https://rootshare.io/auth/confirmation/${emailToken}`;
  const unsubscribeLink = `https://rootshare.io/auth/unsubscribe/${emailToken}`;

  var params = {
    Destination: {
      ToAddresses: [`${emailAddress}`],
    },
    Source: `RootShare Team <dev@rootshare.io>`,
    Template: 'confirmationTemplate2',
    TemplateData: `{ \"confirmationLink\":\"${confirmationLink}\", \"unsubscribeLink\":\"${unsubscribeLink}\" }`,
    ReplyToAddresses: [],
  };

  ses
    .sendTemplatedEmail(params)
    .promise()
    .then((data) => {
      // log('info', data)
    })
    .catch((err) => {
      log('error', err);
    });
}

export function sendExternalAdditionConfirmation(
  emailAddress: string,
  provider: 'Google' | 'LinkedIn'
) {
  const emailToken = convertEmailToToken(emailAddress);
  const revertLink = `https://rootshare.io/auth/reset/${provider}/${emailToken}`;
  const lockLink = `https://rootshare.io/auth/lock/${provider}/${emailToken}`;
  const unsubscribeLink = `https://rootshare.io/auth/unsubscribe/${emailToken}`;

  const body = `
    <h1>Confirmation that login with ${provider} has been added to your account</h1> 
    <p>This was done because the ${provider} account shared your email address. If you did not request or authorize this change, click here to remove the ${provider} login from your RootShare account: ${revertLink}</p>
    <p>If you wish to prevent any future ${provider} registration attempts to your account, click the following link: ${lockLink}</p>
    `;
  const params = {
    Destination: {
      ToAddresses: [`${emailAddress}`],
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
        Data: 'External Login Confirmation',
      },
    },
  };

  ses
    .sendEmail(params)
    .promise()
    .then((data) => {
      // log('info', 'EMAIL SENT ' + emailAddress);
    })
    .catch((err) => {
      log('error', err);
    });
}

// sendLaunchEventInvitation: async (emailAddress) => {
//   const currDate = new Date();
//   const dayBeforeEvent = new Date('August 13, 2020 16:00:00');
//   const endOfEvent = new Date('August 15, 2020 01:00:00');
//   if (currDate < dayBeforeEvent || currDate > endOfEvent) return;

//   const eventID = '5f30b4488e8fb07262044e9f'; // Note: This ID shouldn't change
//   const eventLink = `https://www.rootshare.io/event/${eventID}`;
//   let webinarData = await Webinar.findById(eventID);
//   if (!webinarData)
//     webinarData = {
//       title: 'Baby Boiler Event',
//       brief_description: `RootShare's Event to Kickoff our First Launch!`,
//       full_description: `Attend this online event as Purdue University's very own Baby Boilers join Chris Hartley to share their Purdue story. Kick back, relax, and hear E'Twaun Moore, Robbie Hummel, and JaJuan Johnson chat it up like the good ole days.`,
//     };

//   const body = `
// <h1 style={{fontSize: 14, fontFamily: 'Arial'}}>${webinarData['title']}</h1>

// <p style={{fontSize: 14, fontFamily: 'Arial'}}>${webinarData['brief_description']}</p>

// <p style={{fontSize: 14, fontFamily: 'Arial'}}>${webinarData['full_description']}</p>

// <p style={{fontSize: 14, fontFamily: 'Arial'}}>You can access the event at ${eventLink}</p>
// <p style={{fontSize: 14, fontFamily: 'Arial'}}><b>On Friday, August 14th at 7PM EST<b></p>

// <p style={{fontSize: 14, fontFamily: 'Arial'}}>See you there!</p>
// <p style={{fontSize: 14, fontFamily: 'Arial'}}>-The RootShare Team</p>

// `;

//   var params = {
//     Destination: {
//       ToAddresses: [emailAddress],
//     },
//     Source: `RootShare Team <dev@rootshare.io>`,
//     ReplyToAddresses: [],
//     Message: {
//       Body: {
//         Html: {
//           Charset: 'UTF-8',
//           Data: body,
//         },
//       },
//       Subject: {
//         Data: 'Baby Boiler Event Invite',
//       },
//     },
//   };

//   ses
//     .sendEmail(params)
//     .promise()
//     .then((data) => {
//       // log('info', data)
//     })
//     .catch((err) => {
//       log('error', err);
//     });
// },
