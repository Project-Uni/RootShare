const aws = require('aws-sdk');
aws.config.loadFromPath('../keys/aws_key.json');
let ses = new aws.SES({
  apiVersion: '2010-12-01',
});

export const sendEmail = async (email: string, subject: string, message: string) => {
  const params = {
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
  try {
    await ses.sendEmail(params).promise();
    return { success: true, message: 'Successfully sent email' };
  } catch (err) {
    return { success: false, message: err.message };
  }
};
