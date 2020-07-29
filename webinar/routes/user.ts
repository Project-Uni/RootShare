import log from "../helpers/logger";
import sendPacket from "../helpers/sendPacket";
import { isAuthenticatedWithJWT } from "../middleware/isAuthenticated";

module.exports = (app, webinarCache) => {
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

    log("invite", `Inviting user ${userID} to speak at ${webinarID}`);

    socket.emit("speaking-invite");
    return res.json(sendPacket(1, "Successfully invited user to speak"));
  });
};
