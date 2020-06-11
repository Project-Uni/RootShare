const OpenTok = require('opentok')
const { OPENTOK_API_KEY, OPENTOK_API_SECRET } = require('../../../keys/keys.json')
const opentok = new OpenTok(OPENTOK_API_KEY, OPENTOK_API_SECRET)

var mongoose = require('mongoose')
var Webinar = mongoose.model('webinars')

import log from '../../helpers/logger'
import sendPacket from '../../helpers/sendPacket'

module.exports = {
  createSession: async (userID) => {
    let webinarID

    await opentok.createSession({ mediaMode: "routed" }, async function (error, session) {
      if (error) {
        log('error', error)
      } else {
        // log('info', `Session ID: ${session.sessionId}`);

        let newSession = new Webinar();
        newSession.opentokSessionID = session.sessionId;
        newSession.host = userID

        await newSession.save((err, webinar) => {
          if (err) {
            log('error', err)
            return sendPacket(-1, err)
          } else {
            webinarID = webinar._id
            log('info', 'Webinar creation successful!')
          }
        });
      }
    });

    if (webinarID !== undefined) {
      return sendPacket(1, "Successfully created new webinar", { webinarID })
    }
  },

  getOpenTokSessionID: async (webinarID) => {
    let webinar = await Webinar.findById(webinarID)
    if (webinar) {
      return sendPacket(1, "Sending Webinar's OpenTok SessionID", { opentokSessionID: webinar.opentokSessionID })
    }
  },

  getOpenTokToken: async (sessionID) => {
    let token = await opentok.generateToken(sessionID, {
      role: 'publisher',
      data: 'username=johndoe'
    });

    return sendPacket(1, "Sending Token", { token })
  }
}