import { getUserFromJWT, sendPacket } from '../../helpers/functions';
const mongoose = require('mongoose');
const Webinar = mongoose.model('webinars');

// Only use this middleware after a isAuthenticated or isAuthenticatedWithJWT

export function isEventHost(req, res, next) {
  const { _id: userID } = getUserFromJWT(req);
  const { webinarID } = req.body;
  if (!webinarID) return res.json(sendPacket(-1, 'webinarID not in request body'));

  Webinar.findById(webinarID, ['host'], (err, webinar) => {
    if (err) return res.json(sendPacket(-1, err));
    if (!webinar) return res.json(sendPacket(-1, 'Could not find webinar'));
    if (!webinar['host'].equals(userID))
      return res.json(sendPacket(-1, 'Request not authorized'));

    return next();
  });
}

export function isEventSpeaker(req, res, next) {
  const { _id: userID } = getUserFromJWT(req);
  const { webinarID } = req.body;

  if (!webinarID) return res.json(sendPacket(-1, 'webinarID not in request body'));
  //TODO - To bypass for guest speakers, pass in speakingToken in header for request from client, then authenticate with webinarCache server
  Webinar.findById(webinarID, ['host', 'speakers'], (err, webinar) => {
    if (err) return res.json(sendPacket(-1, err));
    if (!webinar) return res.json(sendPacket(-1, 'Could not find webinar'));

    if (webinar['host'].equals(userID)) return next();
    for (let i = 0; i < webinar['speakers'].length; i++) {
      const speaker = webinar['speakers'][i];
      if (speaker.equals(userID)) return next();
    }

    return res.json(sendPacket(-1, 'Request not authorized, user is not a speaker'));
  });
}
