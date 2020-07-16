const OpenTok = require('opentok');
var mongoose = require('mongoose');
var Webinar = mongoose.model('webinars');
var User = mongoose.model('users');
import axios from 'axios';
const jwt = require('njwt');

const {
  OPENTOK_API_KEY,
  OPENTOK_API_SECRET,
  DEV_BASE_64_MUX,
  PROD_BASE_64_MUX,
} = require('../../../keys/keys.json');
const IN_DEV = process.env.NODE_ENV && process.env.NODE_ENV === 'dev';
const BASE_64_MUX = IN_DEV ? DEV_BASE_64_MUX : PROD_BASE_64_MUX;
const opentok = new OpenTok(OPENTOK_API_KEY, OPENTOK_API_SECRET);

import log from '../../helpers/logger';
import sendPacket from '../../helpers/sendPacket';

module.exports = {
  // Create Webinar and Opentok Session
  // Set creating User as the Event Host
  createNewOpenTokSession: async (webinar) => {
    function createHelper() {
      return new Promise((resolve, reject) => {
        opentok.createSession({ mediaMode: 'routed' }, async (error, session) => {
          if (error) {
            log('error', error);
            return reject(error);
          } else {
            webinar.opentokSessionID = session.sessionId;
            await webinar.save((err, webinar) => {
              if (err) {
                log('error', err);
                return reject(err);
              } else {
                return resolve(session);
              }
            });
          }
        });
      });
    }

    return createHelper()
      .then((session) => {
        return true;
      })
      .catch((err) => {
        return false;
      });
  },

  // Retrive Session ID from DB
  getOpenTokSessionID: async (webinarID) => {
    let webinar = await Webinar.findById(webinarID);
    if (webinar) {
      return sendPacket(1, "Sending Webinar's OpenTok SessionID", {
        opentokSessionID: webinar.opentokSessionID,
      });
    } else {
      return sendPacket(-1, 'Could not send OpenTok SessionID');
    }
  },

  // Generate Token for each Publisher/Host client
  getOpenTokToken: async (sessionID) => {
    let token = await opentok.generateToken(sessionID, {
      role: 'publisher',
      data: 'username=johndoe',
    });

    return sendPacket(1, 'Sending Token', { token });
  },

  getMuxPlaybackID: async (webinarID) => {
    const currWebinar = await Webinar.findById(webinarID);

    if (!currWebinar) {
      return sendPacket(-1, 'No Webinar exists with this ID');
    }
    if (
      !currWebinar.muxPlaybackID ||
      currWebinar.muxPlaybackID.localeCompare('') === 0
    ) {
      return sendPacket(-1, 'Mux Live Stream has not started yet');
    }

    const { muxPlaybackID } = currWebinar;
    return sendPacket(1, 'Sending Mux Playback ID', { muxPlaybackID });
  },

  stopStreaming: async (webinarID) => {
    let currWebinar = await Webinar.findById(webinarID);
    const { opentokBroadcastID } = currWebinar;
    currWebinar.opentokBroadcastID = '';
    currWebinar.muxStreamKey = '';
    currWebinar.muxLiveStreamID = '';
    currWebinar.muxPlaybackID = '';
    currWebinar.save();

    // Stop OpenTok Broadcast
    const JWT = module.exports.createOpenTokJWT();
    if (
      opentokBroadcastID !== undefined &&
      opentokBroadcastID.localeCompare('') !== 0
    ) {
      axios
        .post(
          `https://api.opentok.com/v2/project/${OPENTOK_API_KEY}/broadcast/${opentokBroadcastID}/stop`,
          {},
          {
            headers: { 'X-OPENTOK-AUTH': JWT },
          }
        )
        .then((response) => {
          log('info', `OpenTok Broadcast Successfully Ended`);
        })
        .catch((err) => {
          log('end_broadcast_error', err);
        });
    }

    return sendPacket(1, 'Successfully Stopped Streaming', { webinarID });
    // Mux Live Stream will go IDLE after reconnect window ends (60 seconds)
  },

  startStreaming: async (webinarID) => {
    await module.exports.stopStreaming(webinarID);

    const sessionPacket = await module.exports.getOpenTokSessionID(webinarID);
    if (sessionPacket.success !== 1) {
      return sessionPacket;
    }
    const { opentokSessionID } = sessionPacket.content;

    const muxPacket = await module.exports.createMuxStream();
    if (muxPacket.success !== 1) {
      return muxPacket;
    }
    const { muxStreamKey, muxLiveStreamID, muxPlaybackID } = muxPacket.content;

    const broadcastPacket = await module.exports.createOpenTokStream(
      opentokSessionID,
      muxStreamKey
    );
    if (broadcastPacket.success !== 1) {
      return broadcastPacket;
    }
    const { opentokBroadcastID } = broadcastPacket.content;

    let currWebinar = await Webinar.findById(webinarID);
    currWebinar.muxStreamKey = muxStreamKey;
    currWebinar.muxLiveStreamID = muxLiveStreamID;
    currWebinar.muxPlaybackID = muxPlaybackID;
    currWebinar.opentokBroadcastID = opentokBroadcastID;
    currWebinar.save();

    log('info', 'Successfully Started Streaming on Our Platform');
    return sendPacket(1, 'Successfully Started Streaming on Our Platform', {
      webinarID,
    });
  },

  createMuxStream: async () => {
    let muxStreamKey, muxLiveStreamID, muxPlaybackID;
    const muxReqBody = {
      test: IN_DEV,
      playback_policy: ['public'],
      new_asset_settings: {
        playback_policy: ['public'],
      },
    };
    const options = {
      headers: { Authorization: BASE_64_MUX },
    };
    await axios
      .post('https://api.mux.com/video/v1/live-streams', muxReqBody, options)
      .then((response) => {
        muxStreamKey = response.data.data.stream_key;
        muxLiveStreamID = response.data.data.id;
        muxPlaybackID = response.data.data.playback_ids[0].id;
      })
      .catch((err) => {
        log('mux_error', err);
      });

    if (muxStreamKey !== undefined) {
      log('info', 'Sending Mux Live Stream Keys');
      return sendPacket(1, 'Sending Mux Live Stream Keys', {
        muxStreamKey,
        muxLiveStreamID,
        muxPlaybackID,
      });
    } else {
      log('mux_error', 'Error Creating Mux Live Stream');
      return sendPacket(-1, 'Error Creating Mux Live Stream');
    }
  },

  createOpenTokStream: async (sessionID, muxStreamKey) => {
    let opentokBroadcastID;
    const JWT = module.exports.createOpenTokJWT();
    const options = {
      headers: { 'X-OPENTOK-AUTH': JWT },
    };
    const openTokReqBody = {
      sessionId: sessionID,
      layout: {
        type: 'bestFit',
      },
      maxDuration: 5400,
      outputs: {
        rtmp: {
          serverUrl: 'rtmps://global-live.mux.com:443/app',
          streamName: muxStreamKey,
        },
      },
      resolution: '1280x720',
    };

    await axios
      .post(
        `https://api.opentok.com/v2/project/${OPENTOK_API_KEY}/broadcast`,
        openTokReqBody,
        options
      )
      .then((response) => {
        opentokBroadcastID = response.data.id;
      })
      .catch((err) => {
        log('opentok_error', err);
      });

    if (opentokBroadcastID !== undefined) {
      log('info', 'Sending OpenTok Broadcast ID');
      return sendPacket(1, 'Sending OpenTok Broadcast ID', { opentokBroadcastID });
    } else {
      log('error', 'Error Creating OpenTok Broadcast');
      return sendPacket(-1, 'Error Creating OpenTok Broadcast');
    }
  },

  createOpenTokJWT: () => {
    const claims = {
      iss: OPENTOK_API_KEY,
      ist: 'project',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 300,
      jti: 'jwt_nonce',
    };

    return jwt.create(claims, OPENTOK_API_SECRET).compact();
  },

  changeBroadcastLayout: (webinarID, type, streamID, callback) => {
    let layoutClass;
    if (type === 'bestFit') layoutClass = 'full';
    else if (type === 'horizontalPresentation') layoutClass = 'focus';
    else return callback(sendPacket(-1, 'Invalid Layout Type'));

    Webinar.findById(webinarID, (err, currWebinar) => {
      if (err) return callback(sendPacket(-1, 'Cannot find current Webinar'));
      const { opentokBroadcastID, opentokSessionID } = currWebinar;
      if (
        !opentokBroadcastID ||
        opentokBroadcastID === undefined ||
        opentokBroadcastID === ''
      )
        return callback(sendPacket(-1, 'OpenTok Broadcast has not yet started'));

      const JWT = module.exports.createOpenTokJWT();
      axios
        .put(
          `https://api.opentok.com/v2/project/${OPENTOK_API_KEY}/broadcast/${opentokBroadcastID}/layout`,
          { type },
          {
            headers: { 'X-OPENTOK-AUTH': JWT },
          }
        )
        .then((response) => {
          log('info', `Changed OpenTok Broadcast Layout to ${type}`);

          if (type === 'bestFit')
            return callback(
              sendPacket(1, 'Successfully changed OpenTok Broadcast Layout')
            );
          axios
            .put(
              `https://api.opentok.com/v2/project/${OPENTOK_API_KEY}/session/${opentokSessionID}/stream`,
              {
                items: [
                  {
                    id: streamID,
                    layoutClassList: [layoutClass],
                  },
                ],
              },
              {
                headers: { 'X-OPENTOK-AUTH': JWT },
              }
            )
            .then((response) => {
              log('info', `Changed Stream Layout Class to ${layoutClass}`);
              return callback(
                sendPacket(1, 'Successfully changed OpenTok Broadcast Layout')
              );
            })
            .catch((err) => {
              log('error', err);
              return callback(
                sendPacket(-1, 'There was an Error changing the Stream Layout Class')
              );
            });
        })
        .catch((err) => {
          log('error', err);
          return callback(
            sendPacket(-1, 'There was an Error changing the Broadcast Layout')
          );
        });
    });
  },
};
