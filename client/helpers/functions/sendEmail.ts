import aws = require('aws-sdk');

const AWSKeys = require('../../../keys/aws_key.json');

const ses = new aws.SES({
  accessKeyId: AWSKeys.ses.accessKeyId,
  secretAccessKey: AWSKeys.ses.secretAccessKey,
  region: AWSKeys.ses.region,
  apiVersion: '2010-12-01',
  signatureVersion: 'v4',
});

export const sendEmail = async (
  emailAddresses: string[],
  subject: string,
  message: string
) => {
  const params = {
    Destination: {
      ToAddresses: emailAddresses,
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
  try {
    await ses.sendEmail(params).promise();
    return { success: true, message: 'Successfully sent email' };
  } catch (err) {
    return { success: false, message: err.message };
  }
};
