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

    const speaking_token = crypto.randomBytes(20).toString();
    webinarCache[webinarID].speakingToken = speaking_token;

    socket.emit("speaking-invite", { speaking_token });
    return res.json(sendPacket(1, "Successfully invited user to speak"));
  });
};
