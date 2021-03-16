const Cryptr = require('cryptr');
const aws = require('aws-sdk');

import { User } from '../../rootshare_db/models';
import {
  log,
  sendPacket,
  hashPassword,
  convertEmailToToken,
  convertTokenToEmail,
} from '../../helpers/functions';

const { CRYPT_SECRET } = require('../../../keys/keys.json');
const cryptr = new Cryptr(CRYPT_SECRET);

aws.config.loadFromPath('../keys/aws_key.json');
let ses = new aws.SES({
  apiVersion: '2010-12-01',
});

export function updatePassword(emailToken: string, newPassword: string, callback) {
  let emailAddress = convertTokenToEmail(emailToken);
  User.model.findOne({ email: emailAddress }, (err, currUser) => {
    if (err) return callback(-1, err);
    if (!currUser) return callback(sendPacket(0, 'User code invalid'));

    currUser.hashedPassword = hashPassword(newPassword);
    currUser.save(function (err) {
      if (err) return callback(sendPacket(-1, "Could not save user's new password"));
      return callback(sendPacket(1, 'Password update successful!'));
    });
  });
}

export function sendPasswordResetLink(emailAddress: string, callback) {
  emailIsValid(emailAddress, (valid) => {
    if (!valid)
      return callback(sendPacket(0, "Can't reset password for this email"));

    const emailToken = convertEmailToToken(emailAddress);
    const resetPasswordLink = `https://rootshare.io/register/resetPassword/${emailToken}`;
    const unsubscribeLink = `https://rootshare.io/auth/unsubscribe/${emailToken}`;

    var params = {
      Destination: {
        ToAddresses: [`${emailAddress}`],
      },
      Source: `RootShare Team <dev@rootshare.io>`,
      Template: 'resetPasswordTemplate',
      TemplateData: `{ \"resetPasswordLink\":\"${resetPasswordLink}\", \"unsubscribeLink\":\"${unsubscribeLink}\" }`,
      ReplyToAddresses: [],
    };

    ses
      .sendTemplatedEmail(params)
      .promise()
      .then((data) => {
        // log('info', data)
        return callback(sendPacket(1, 'Password reset link has been sent'));
      })
      .catch((err) => {
        log('error', err);
        return callback(sendPacket(-1, 'Could not send pasword reset link'));
      });
  });
}

export function emailIsValid(emailAddress: string, callback) {
  User.model.findOne({ email: emailAddress }, ['hashedPassword'], (err, user) => {
    return callback(
      !err &&
        user !== undefined &&
        user !== null &&
        user.hashedPassword !== undefined
    );
  });
}
