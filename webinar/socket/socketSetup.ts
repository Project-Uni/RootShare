import * as socketio from "socket.io";
import log from "../helpers/logger";

import { WebinarCache } from "../types/types";

module.exports = (io, webinarCache: WebinarCache) => {
  io.on("connection", (socket: socketio.Socket) => {
    let socketUserId = "";
    let socketWebinarId = "";
    log("connection", `${socket.client.id}`);

    socket.on("new-user", (data: { webinarID: string; userID: string }) => {
      const { userID, webinarID } = data;
      if (!userID || !webinarID) {
        return log("alert", "Invalid socket connection received");
      }
      log("new-user", `${userID}`);

      socketUserId = userID;
      socketWebinarId = webinarID;

      if (!(webinarID in webinarCache)) {
        socket.emit("webinar-error", "Webinar not in cache");
        return log("error", "Invalid webinarID received");
      }
      socket.join(`${webinarID}`);

      webinarCache[webinarID].users[userID] = socket;
      console.log("Webinar cache:", webinarCache);
    });

    socket.on("disconnect", () => {
      log("disconnect", `${socketUserId}`);
      const webinarExists = socketWebinarId in webinarCache;
      if (webinarExists) {
        const userExists = socketUserId in webinarCache[socketWebinarId].users;
        if (userExists)
          delete webinarCache[socketWebinarId].users[socketUserId];
      }
    });

    socket.on(
      "speaking-invite-accepted",
      (data: { speaking_token: string }) => {
        //TODO - Notify the host that user has accepted speaking invite
        const { speaking_token } = data;
        console.log("Speaking invite accepted with token:", speaking_token);
        if (
          !webinarCache[socketWebinarId].speakingToken ||
          webinarCache[socketWebinarId].speakingToken !== speaking_token
        ) {
          log("socket", "Speaking token was rejected");
          return socket.emit("speaking-token-rejected");
        }
        log("socket", "Speaking token was accepted");
        webinarCache[socketWebinarId].guestSpeakerID = socketUserId;
        socket.emit("speaking-token-accepted");
      }
    );

    socket.on("speaking-invite-rejected", () => {
      //TODO - Notify the host that user has rejected speaking invite
      log("socket", "Speaking invite rejected");
    });
  });
};
