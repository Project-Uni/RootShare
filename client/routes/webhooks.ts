import { Express } from 'express';
const { MessagingResponse, VoiceResponse } = require('twilio').twiml;

export default function webhooks(app: Express) {
  app.post('/api/webhooks/twilio/sms', (req, res) => {
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

  app.post('/api/webhooks/twilio/voice', (req, res) => {
    const twilio_response = new VoiceResponse();
    twilio_response.say(
      { voice: 'alice' },
      `This is an automated system from RootShare, the host of Meet The Greeks. 
      To contact the sender of the message, please reach out to someone in the fraternity directly. 
      Thank you, and boiler up!`
    );

    res.type('text/xml');
    res.send(twilio_response.toString());
  });
}
