import { Express } from 'express';
const MessagingResponse = require('twilio').twiml.MessagingResponse;

export default function webhooks(app: Express) {
  app.post('/api/webhooks/twilio/sms', async (req, res) => {
    const twilio_response = new MessagingResponse();
    twilio_response.message(
      'This is an automated message from RootShare, the host of Meet The Greeks.'
    );
    twilio_response.message(
      'To respond, please reach out to a member of the fraternity directly.'
    );

    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twilio_response.toString());
  });
}
