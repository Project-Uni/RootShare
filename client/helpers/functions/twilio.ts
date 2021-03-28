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

  const smsPromises = formattedNumbers.map((phoneNumber) => {
    if (!phoneNumber) return null;
    return twilio_client.messages.create({
      to: phoneNumber,
      from: TWILIO_PHONE_NUMBER,
      body: message,
      mediaUrl: imageURL,
    });
  });

  return Promise.all(smsPromises)
    .then((values) => {
      console.log('Twilio success values:', values);
      return { success: 1, message: 'Successfully sent all messages' };
    })
    .catch((err) => {
      console.log('Twilio IO Error:', err);
      return { success: -1, message: err.message };
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
