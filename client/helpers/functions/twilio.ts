import { log } from './logger';

const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = require('../../../keys/keys.json');

const twilio_client = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
const TWILIO_PHONE_NUMBER = '+17652343229';

export async function sendSMS(
  recipients: string[],
  message: string,
  imageURL?: string
) {
  const formattedNumbers: (string | null)[] = [];
  for (let i = 0; i < recipients.length; i++) {
    formattedNumbers.push(formatSMSRecipients(recipients[i]));
  }

  const smsPromises = formattedNumbers.map(async (phoneNumber) => {
    if (!phoneNumber)
      return { success: true, message: 'No associated or invalid number' };
    try {
      await twilio_client.messages.create({
        to: phoneNumber,
        from: TWILIO_PHONE_NUMBER,
        body: message,
        mediaUrl: imageURL,
      });
      return { success: true, message: 'Sent message successfully' };
    } catch (err) {
      log('Twilio IO Error', err.message);
      return { success: false, message: err };
    }
  });

  return Promise.all(smsPromises)
    .then((values) => {
      let someSuccessFlag = false;
      let hasErr = false;

      values.forEach((v) => {
        if (v && !someSuccessFlag) someSuccessFlag = true;
        if (!v && !hasErr) hasErr = true;
      });

      if (hasErr) {
        if (someSuccessFlag)
          return {
            success: 1,
            message:
              'There was an error sending some messages, but most were sent successfully',
          };
        return {
          success: -1,
          message: 'There was an error sending all messages',
        };
      }

      return { success: 1, message: 'Successfully sent all messages' };
    })
    .catch((err) => {
      log('unhandled error', err.message);
      return { success: 0, message: `Unhandled Twilio Error: ${err.message}` };
    });
}

function formatSMSRecipients(phoneNumber: string) {
  if (!phoneNumber) return null;
  let output = phoneNumber.slice().replace(/\D/g, '');
  //Remove all spaces and non numbers
  if (output.length === 10) {
    output = `+1${output}`;
  } else if (output.length === 11 && output[0] === '1') {
    output = `+${output}`;
  } else {
    return null;
  }
  return output;
}

// sendSMS(['(408) 644-9017'], 'RootShare SMS!');
