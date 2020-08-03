import log from "../helpers/logger";
import sendPacket from "../helpers/sendPacket";
import { isAuthenticatedWithJWT } from "../middleware/isAuthenticated";

import { WebinarCache, Webinar } from "../types/types";

module.exports = (app, webinarCache: WebinarCache) => {
  app.post("/api/addWebinarToCache", isAuthenticatedWithJWT, (req, res) => {
    console.log(req.connection.remoteAddress);
    const { webinarID } = req.body;
    if (!webinarID) return res.json(sendPacket(-1, "webinarID not in request"));

    if (webinarID in webinarCache)
      return res.json(sendPacket(0, "Webinar already initialized in cache"));

    const startTime = Date.now();
    webinarCache[webinarID] = { users: {}, startTime };

    log("info", `Webinars: ${Object.keys(webinarCache)}`);

    return res.json(sendPacket(1, "Successfully initialized webinar in cache"));
  });

  app.post(
    "/api/removeWebinarFromCache",
    isAuthenticatedWithJWT,
    (req, res) => {
      const { webinarID } = req.body;

      if (!webinarID)
        return res.json(sendPacket(-1, "webinarID not in request"));
      if (!(webinarID in webinarCache))
        return res.json(sendPacket(0, "Webinar not found in cache"));

      delete webinarCache[webinarID];

      log("info", `Webinars: ${Object.keys(webinarCache)}`);
      return res.json(sendPacket(1, "Successfully removed webinar in cache"));
    }
  );

  app.get(
    "/api/webinar/:webinarID/getActiveViewers",
    isAuthenticatedWithJWT,
    (req, res) => {
      const { webinarID } = req.params;
      if (!webinarID)
        return res.json(sendPacket(-1, "webinarID not in request"));
      if (!(webinarID in webinarCache))
        return res.json(sendPacket(0, "Webinar not found in cache"));

      const activeUserIDs = Object.keys(webinarCache[webinarID].users);

      return res.json(
        sendPacket(1, "Successfully fetched active users", {
          activeUserIDs,
          currentSpeaker: webinarCache[webinarID].guestSpeaker,
        })
      );
    }
  );

  app.get(
    "/api/webinar/:webinarID/getGuestSpeakerSessionID",
    isAuthenticatedWithJWT,
    (req, res) => {
      const { webinarID } = req.params;
      if (!(webinarID in webinarCache))
        return res.json(sendPacket(0, "Webinar not found in cache"));

      const sessionID = webinarCache[webinarID].guestSpeaker.sessionID;
      if (!sessionID)
        return res.json(sendPacket(0, "SessionID not set for guest speaker"));

      return res.json(
        sendPacket(1, "Successfully retrieved session id for guest speaker", {
          sessionID,
        })
      );
    }
  );
};
