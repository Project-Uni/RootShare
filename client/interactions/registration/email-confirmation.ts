import { User, Webinar } from '../../models';

const Cryptr = require('cryptr');

const { CRYPT_SECRET } = require('../../../keys/keys.json');
const cryptr = new Cryptr(CRYPT_SECRET);
const aws = require('aws-sdk');
aws.config.loadFromPath('../keys/aws_key.json');
import log from '../../helpers/logger';

let ses = new aws.SES({
  apiVersion: '2010-12-01',
});

module.exports = {
  confirmUser: async (emailToken) => {
    let emailAddress = module.exports.convertTokenToEmail(emailToken);
    let currUser;
    try {
      currUser = await User.findOne({ email: emailAddress });
    } catch (error) {
      log('MONGO ERROR', error);
    }

    if (!currUser) {
      return null;
    }

    currUser.confirmed = true;
    await currUser.save();
    return currUser;
  },

  unsubscribeUser: async (emailToken) => {
    let emailAddress = module.exports.convertTokenToEmail(emailToken);
    let currUser;
    try {
      currUser = await User.findOne({ email: emailAddress });
    } catch (error) {
      log('MONGO ERROR', error);
    }

    if (!currUser) {
      return null;
    }

    currUser.sendEmails = false;
    await currUser.save();
    return currUser;
  },

  sendConfirmationEmail: (emailAddress) => {
    const emailToken = module.exports.convertEmailToToken(emailAddress);
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
  },

  sendLaunchEventInvitation: async (emailAddress) => {
    const currDate = new Date();
    const dayBeforeEvent = new Date('August 13, 2020 12:00:00');
    const endOfEvent = new Date('August 15, 2020 01:00:00');
    if (currDate < dayBeforeEvent || currDate > endOfEvent) return;

    const eventID = '5f30b4488e8fb07262044e9f'; // Note: This ID shouldn't change
    const eventLink = `https://www.rootshare.io/event/${eventID}`;
    let webinarData = await Webinar.findById(eventID);
    if (!webinarData)
      webinarData = {
        title: 'Baby Boiler Event',
        brief_description: `RootShare's Event to Kickoff our First Launch!`,
        full_description: `Attend this online event as Purdue University's very own Baby Boilers join Chris Hartley to share their Purdue story. Kick back, relax, and hear E'Twaun Moore, Robbie Hummel, and JaJuan Johnson chat it up like the good ole days.`,
      };

    const body = `
  <h1 style={{fontSize: 14, fontFamily: 'Arial'}}>${webinarData['title']}</h1>

  <p style={{fontSize: 14, fontFamily: 'Arial'}}>${webinarData['brief_description']}</p>

  <p style={{fontSize: 14, fontFamily: 'Arial'}}>${webinarData['full_description']}</p>

  <p style={{fontSize: 14, fontFamily: 'Arial'}}>You can access the event at ${eventLink}</p>
  <p style={{fontSize: 14, fontFamily: 'Arial'}}><b>On Friday, August 14th at 7PM EST<b></p>

  <p style={{fontSize: 14, fontFamily: 'Arial'}}>See you there!</p>
  <p style={{fontSize: 14, fontFamily: 'Arial'}}>-The RootShare Team</p>

  `;

    var params = {
      Destination: {
        ToAddresses: [emailAddress],
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
          Data: 'Baby Boiler Event Invite',
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
  },

  convertEmailToToken: (emailAddress) => {
    let token = cryptr.encrypt(emailAddress);
    return token;
  },

  convertTokenToEmail: (emailToken) => {
    let emailAddress;
    try {
      emailAddress = cryptr.decrypt(emailToken);
      return emailAddress;
    } catch {
      return null;
    }
  },
};
