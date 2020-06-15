const OpenTok = require('opentok')
var mongoose = require('mongoose')
var Webinar = mongoose.model('webinars')
import axios from 'axios'
const jwt = require('njwt')

const { OPENTOK_API_KEY, OPENTOK_API_SECRET, JWT_KEY } = require('../../../keys/keys.json')
const opentok = new OpenTok(OPENTOK_API_KEY, OPENTOK_API_SECRET)

import log from '../../helpers/logger'
import sendPacket from '../../helpers/sendPacket'
import { resolve } from 'dns'

module.exports = {
  createSession: async (userID) => {
    let webinarID

    function createHelper() {
      return new Promise((resolve, reject) => {
        opentok.createSession({ mediaMode: "routed" }, async function (error, session) {
          if (error) {
            log('error', error)
            return reject(error)
          } else {

            let newSession = new Webinar()
            newSession.opentokSessionID = session.sessionId
            newSession.host = userID

            await newSession.save((err, webinar) => {
              if (err) {
                log('error', err)
                return reject(err)
              } else {
                log('info', `Webinar creation successful!`)
                webinarID = webinar._id
                return resolve(session)
              }
            });
          }
        });
      });
    }

    await createHelper()
    if (webinarID !== undefined) {
      return sendPacket(1, "Successfully created new webinar", { webinarID })
    } else {
      return sendPacket(-1, "Could not create new webinar")
    }
  },

  getOpenTokSessionID: async (webinarID) => {
    let webinar = await Webinar.findById(webinarID)
    if (webinar) {
      return sendPacket(1, "Sending Webinar's OpenTok SessionID", { opentokSessionID: webinar.opentokSessionID })
    } else {
      return sendPacket(-1, "Could not send OpenTok SessionID")
    }
  },

  getOpenTokToken: async (sessionID) => {
    let token = await opentok.generateToken(sessionID, {
      role: 'publisher',
      data: 'username=johndoe'
    });

    return sendPacket(1, "Sending Token", { token })
  },

  startStreaming: (webinarID) => {
    const muxStreamKey = module.exports.createMuxStream()
  },

  createMuxStream: () => {
    const muxOptions = {
      "reconnect_window": 60,
      "playback_policy": [
        "public"
      ],
      "new_asset_settings": {
        "playback_policy": [
          "public"
        ],
        "input": []
      },
      "passthrough": "You shall pass!",
      "reduced_latency": true,
      "simulcast_targets": [],
      "test": true
    }
    axios.post('https://api.mux.com/video/v1/live-streams')
  },

  createOpenTokStream: async (sessionID) => {
    const claims = {
      "iss": OPENTOK_API_KEY,
      "ist": "project",
      "iat": Math.floor(Date.now() / 1000),
      "exp": Math.floor(Date.now() / 1000) + 300,
      "jti": "jwt_nonce"
    }
    const JWT = jwt.create(claims, OPENTOK_API_SECRET).compact()
    log("jwt", JWT)
    jwt.verify(JWT, OPENTOK_API_SECRET, (err, verifiedJwt) => {
      if (err) {
        console.log(err.message)
      } else {
        console.log(verifiedJwt)
      }
    })
    const options = {
      headers: { 'X-OPENTOK-AUTH': JWT }
    }
    const openTokReqBody = {
      "sessionId": sessionID,
      "layout": {
        "type": "bestFit",
      },
      "maxDuration": 5400,
      "outputs": {
        "hls": {},
        "rtmp": [{
          "serverUrl": "rtmp://global-live.mux.com:5222/app",
          "streamName": "RootShareWebinarStream"
        }]
      },
      "resolution": "1280x720"
    }

    axios.post(
      `https://api.opentok.com/v2/project/${OPENTOK_API_KEY}/broadcast`,
      openTokReqBody,
      options
    ).then((response) => {
      log('info', response.data)
    }).catch((err) => {
      log('error', err)
    })
  }

}