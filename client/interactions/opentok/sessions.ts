const OpenTok = require('opentok')
const { OPENTOK_API_KEY, OPENTOK_API_SECRET } = require('../../../keys/keys.json')
const opentok = new OpenTok(OPENTOK_API_KEY, OPENTOK_API_SECRET)

import log from '../../helpers/logger'

module.exports = {
  createSession: () => {
    let sessionId

    opentok.createSession({ mediaMode: "routed" }, function (error, session) {
      if (error) {
        log('error', error)
      } else {
        sessionId = session.sessionId;
        log('info', `Session ID: ${sessionId}`);
      }
    });
  }
}