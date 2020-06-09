const OpenTok = require('opentok')
// const OT = require('@opentok/client')
const { OPENTOK_API_KEY, OPENTOK_API_SECRET } = require('../../../keys/keys.json')
const opentok = new OpenTok(OPENTOK_API_KEY, OPENTOK_API_SECRET)

import log from '../../helpers/logger'
import sendPacket from '../../helpers/sendPacket'

module.exports = {
  createSession: async () => {
    let sessionID

    let session = await opentok.createSession({ mediaMode: "routed" }, function (error, session) {
      if (error) {
        log('error', error)
      } else {
        sessionID = session.sessionId;
        log('info', `Session ID: ${sessionID}`);
      }
    });

    return sessionID
  },

  getToken: async (sessionID) => {
    let token = await opentok.generateToken(sessionID, {
      role: 'publisher',
      data: 'username=johndoe'
    })

    return token

    // let session = OT.initSession(OPENTOK_API_KEY, sessionID)
    // session.connect(token, function (error) {
    //   if (error) {
    //     log("error", error.name + error.message);
    //   } else {
    //     log('info', 'Connected to the session');
    //   }
    // });
  }
}