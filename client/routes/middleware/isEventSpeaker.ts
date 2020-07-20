import sendPacket from '../../helpers/sendPacket';
const mongoose = require('mongoose');
const Webinar = mongoose.model('webinars');

// Only use this middleware after a isAuthenticated or isAuthenticatedWithJWT
export function isEventSpeaker(req, res, next) {
  const userID: string = req.user._id;
  const { webinarID } = req.body;
  if (webinarID) {
    Webinar.findById(webinarID, ['host', 'speakers'], (err, webinar) => {
      if (err || webinar === undefined || webinar === null)
        return res.json(sendPacket(-1, 'Could not find webinar'));

      if (webinar['host'].equals(userID)) return next();
      for (let i = 0; i < webinar['speakers'].length; i++) {
        const speaker = webinar['speakers'][i];
        if (speaker.equals(userID)) return next();
      }

      return res.json(
        sendPacket(-1, 'Request not authorized, user is not a speaker')
      );
    });
  }
}
