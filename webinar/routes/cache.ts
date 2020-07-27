import log from "../helpers/logger";
import sendPacket from "../helpers/sendPacket";
import { isAuthenticatedWithJWT } from "../middleware/isAuthenticated";

module.exports = (app, webinarCache) => {
  app.post("/api/createWebinar", isAuthenticatedWithJWT, (req, res) => {
    const { webinarID } = req.body;
    if (!webinarID) return res.json(sendPacket(-1, "webinarID not in request"));

    if (webinarID in webinarCache)
      return res.json(sendPacket(0, "Webinar already initialized in cache"));

    const startTime = Date.now();
    webinarCache[webinarID] = { users: {}, startTime };

    return res.json(sendPacket(1, "Successfully initialized webinar in cache"));
  });

  app.post("/api/removeWebinar", isAuthenticatedWithJWT, (req, res) => {
    const { webinarID } = req.body;

    if (!webinarID) return res.json(sendPacket(-1, "webinarID not in request"));
    if (!(webinarID in webinarCache))
      return res.json(sendPacket(0, "Webinar not found in cache"));

    delete webinarCache[webinarID];
  });

  app.post("/api/getActiveUsers", isAuthenticatedWithJWT, (req, res) => {
    const { webinarID } = req.body;
    if (!webinarID) return res.json(sendPacket(-1, "webinarID not in request"));
    if (!(webinarID in webinarCache))
      return res.json(sendPacket(0, "Webinar not found in cache"));

    const activeUserIDs = Object.keys(webinarCache[webinarID].users);

    return res.json(
      sendPacket(1, "Successfully fetched active users", { activeUserIDs })
    );
  });
};
