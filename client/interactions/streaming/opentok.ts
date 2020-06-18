const OpenTok = require('opentok')
var mongoose = require('mongoose')
var Webinar = mongoose.model('webinars')
var User = mongoose.model('users')
import axios from 'axios'
const jwt = require('njwt')

const { OPENTOK_API_KEY, OPENTOK_API_SECRET, BASE_64_MUX } = require('../../../keys/keys.json')
const opentok = new OpenTok(OPENTOK_API_KEY, OPENTOK_API_SECRET)

import log from '../../helpers/logger'
import sendPacket from '../../helpers/sendPacket'
import { resolve } from 'dns'

module.exports = {
  // Create Webinar and Opentok Session
  // Set creating User as the Event Host

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
                webinarID = webinar._id
                return resolve(session)
              }
            });
          }
        });
      });
    }

    await createHelper()
    if (webinarID === undefined) {
      log('error', 'There was an error creating a new webinar')
      return sendPacket(-1, "There was an error creating a new webinar")
    }

    // Add Webinar to User's List of Events
    let currUser = await User.findById(userID)
    currUser.RSVPWebinars.push(webinarID)
    currUser.save()
    log('info', "Successfully created new webinar")
    return sendPacket(1, "Successfully created new webinar", { webinarID })
  },

  getLatestWebinarID: async (userID) => {
    const currUser = await User.findById(userID)

    if (!currUser) {
      return sendPacket(-1, 'Could not find User')
    }
    const RSVPCount = currUser.RSVPWebinars.length
    if (RSVPCount == 0) {
      return sendPacket(0, 'User Has no Webinars')
    }

    const webinarID = currUser.RSVPWebinars[RSVPCount - 1]
    return sendPacket(1, "Sending Latest Webinar ID", { webinarID })
  },

  // Retrive Session ID from DB 
  getOpenTokSessionID: async (webinarID) => {
    let webinar = await Webinar.findById(webinarID)
    if (webinar) {
      return sendPacket(1, "Sending Webinar's OpenTok SessionID", { opentokSessionID: webinar.opentokSessionID })
    } else {
      return sendPacket(-1, "Could not send OpenTok SessionID")
    }
  },

  // Generate Token for each Viewer/Publisher/Host client
  getOpenTokToken: async (sessionID) => {
    let token = await opentok.generateToken(sessionID, {
      role: 'publisher',
      data: 'username=johndoe'
    });

    return sendPacket(1, "Sending Token", { token })
  },

  getMuxPlaybackID: async (webinarID) => {
    const currWebinar = await Webinar.findById(webinarID)

    if (!currWebinar) {
      return sendPacket(-1, "No Webinar exists with this ID")
    }
    if (!currWebinar.muxPlaybackID || currWebinar.muxPlaybackID.localeCompare("") === 0) {
      return sendPacket(-1, "Mux Live Stream has not started yet")
    }

    const { muxPlaybackID } = currWebinar
    return sendPacket(1, "Sending Mux Playback ID", { muxPlaybackID })
  },

  stopStreaming: async (webinarID) => {
    let currWebinar = await Webinar.findById(webinarID)
    const { opentokBroadcastID } = currWebinar
    currWebinar.opentokBroadcastID = ""
    currWebinar.muxStreamKey = ""
    currWebinar.muxLiveStreamID = ""
    currWebinar.muxPlaybackID = ""
    currWebinar.save()

    // Stop OpenTok Broadcast
    const JWT = module.exports.createOpenTokJWT()
    if (opentokBroadcastID !== undefined) {
      axios.post(
        `https://api.opentok.com/v2/project/${OPENTOK_API_KEY}/broadcast/${opentokBroadcastID}/stop`,
        {},
        {
          headers: { 'X-OPENTOK-AUTH': JWT }
        }
      ).then((response) => {
        log('info', `OpenTok Broadcast Successfully Ended`)
      }).catch((err) => {
        log('end_broadcast_error', err)
      })
    }

    return sendPacket(1, "Successfully Stopped Streaming", { webinarID })
    // Mux Live Stream will go IDLE after reconnect window ends (60 seconds)
  },

  startStreaming: async (webinarID) => {
    await module.exports.stopStreaming(webinarID)

    const sessionPacket = await module.exports.getOpenTokSessionID(webinarID)
    if (sessionPacket.success !== 1) {
      return sessionPacket
    }
    const { opentokSessionID } = sessionPacket.content

    const muxPacket = await module.exports.createMuxStream()
    if (muxPacket.success !== 1) {
      return muxPacket
    }
    const { muxStreamKey, muxLiveStreamID, muxPlaybackID } = muxPacket.content

    const broadcastPacket = await module.exports.createOpenTokStream(opentokSessionID, muxStreamKey)
    if (broadcastPacket.success !== 1) {
      return broadcastPacket
    }
    const { opentokBroadCastID } = broadcastPacket.content

    let currWebinar = await Webinar.findById(webinarID)
    currWebinar.muxStreamKey = muxStreamKey
    currWebinar.muxLiveStreamID = muxLiveStreamID
    currWebinar.muxPlaybackID = muxPlaybackID
    currWebinar.opentokBroadcastID = opentokBroadCastID
    currWebinar.save()

    log('info', 'Successfully Started Streaming on Our Platform')
    return sendPacket(
      1,
      "Successfully Started Streaming on Our Platform",
      { webinarID }
    )
  },

  createMuxStream: async () => {
    let muxStreamKey, muxLiveStreamID, muxPlaybackID
    const muxReqBody = {
      "test": true,
      "playback_policy": ["public"],
      "new_asset_settings": {
        "playback_policy": ["public"]
      }
    }
    const options = {
      headers: { "Authorization": BASE_64_MUX }
    }
    await axios.post('https://api.mux.com/video/v1/live-streams',
      muxReqBody,
      options
    ).then((response) => {
      muxStreamKey = response.data.data.stream_key
      muxLiveStreamID = response.data.data.id
      muxPlaybackID = response.data.data.playback_ids[0].id
    }).catch((err) => {
      log('mux_error', err)
    })

    if (muxStreamKey !== undefined) {
      log('info', 'Sending Mux Live Stream Keys')
      return sendPacket(1, "Sending Mux Live Stream Keys", { muxStreamKey, muxLiveStreamID, muxPlaybackID })
    } else {
      log('error', 'Error Creating Mux Live Stream')
      return sendPacket(-1, "Error Creating Mux Live Stream")
    }
  },

  createOpenTokStream: async (sessionID, muxStreamKey) => {
    let opentokBroadCastID
    const JWT = module.exports.createOpenTokJWT()
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
        "rtmp": {
          "serverUrl": "rtmp://global-live.mux.com:5222/app",
          "streamName": muxStreamKey
        }
      },
      "resolution": "1280x720"
    }

    await axios.post(
      `https://api.opentok.com/v2/project/${OPENTOK_API_KEY}/broadcast`,
      openTokReqBody,
      options
    ).then((response) => {
      opentokBroadCastID = response.data.id
    }).catch((err) => {
      log('opentok_error', err)
    })

    if (opentokBroadCastID !== undefined) {
      log('info', 'Sending OpenTok Broadcast ID')
      return sendPacket(1, "Sending OpenTok Broadcast ID", { opentokBroadCastID })
    } else {
      log('error', 'Error Creating OpenTok Broadcast')
      return sendPacket(-1, "Error Creating OpenTok Broadcast")
    }
  },

  createOpenTokJWT: () => {
    const claims = {
      "iss": OPENTOK_API_KEY,
      "ist": "project",
      "iat": Math.floor(Date.now() / 1000),
      "exp": Math.floor(Date.now() / 1000) + 300,
      "jti": "jwt_nonce"
    }

    return jwt.create(claims, OPENTOK_API_SECRET).compact()
  }

}