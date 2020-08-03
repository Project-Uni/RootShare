const crypto = require("crypto");

import log from "../helpers/logger";
import sendPacket from "../helpers/sendPacket";
import { isAuthenticatedWithJWT } from "../middleware/isAuthenticated";
import { WebinarCache } from "../types/types";

module.exports = (app, webinarCache: WebinarCache) => {
  app.post("/api/inviteUserToSpeak", isAuthenticatedWithJWT, (req, res) => {
    const { webinarID, userID } = req.body;
    if (!webinarID || !userID)
      return res.json(
        sendPacket(-1, "userID or webinarID missing from request body")
      );

    if (!(webinarID in webinarCache))
      return res.json(sendPacket(0, "Webinar not in cache"));

    if (!(userID in webinarCache[webinarID].users))
      return res.json(sendPacket(0, "User not found in webinar cache"));

    const socket = webinarCache[webinarID].users[userID];

    const speaking_token = crypto.randomBytes(64).toString();
    webinarCache[webinarID].speakingToken = speaking_token;

    socket.emit("speaking-invite", { speaking_token });
    return res.json(sendPacket(1, "Successfully invited user to speak"));
  });

  app.post("/api/removeGuestSpeaker", isAuthenticatedWithJWT, (req, res) => {
    const { webinarID } = req.body;
    if (!webinarID)
      return res.json(sendPacket(-1, "webinarID missing from request body"));

    if (!(webinarID in webinarCache))
      return res.json(sendPacket(0, "Webinar not in cache"));

    const speakerID = webinarCache[webinarID].guestSpeaker._id;

    delete webinarCache[webinarID].guestSpeaker;
    delete webinarCache[webinarID].speakingToken;

    if (!(speakerID in webinarCache[webinarID].users))
      return res.json(sendPacket(1, "User already left the stream"));

    const socket = webinarCache[webinarID].users[speakerID];
    socket.emit("speaking-revoke");

    return res.json(
      sendPacket(1, "Successfully removed user speaking privilege")
    );
  });

  app.post("/api/setConnectionID", isAuthenticatedWithJWT, (req, res) => {
    const { connectionID, webinarID, speaking_token } = req.body;
    if (!connectionID || !webinarID || !speaking_token)
      return res.json(
        sendPacket(
          -1,
          "connectionID, webinarID, or speaking_token missing from request body"
        )
      );
    if (!webinarCache[webinarID].speakingToken)
      return res.json(sendPacket(0, "No guest speakers in current webinar"));

    if (webinarCache[webinarID].speakingToken !== speaking_token)
      return res.json(sendPacket(0, "Speaking token does not match webinar"));

    webinarCache[webinarID].guestSpeaker.connectionID = connectionID;

    console.log(webinarCache[webinarID]);

    return res.json(
      sendPacket(1, "Successfully updated connectionID for guest speaker")
    );
  });
};
