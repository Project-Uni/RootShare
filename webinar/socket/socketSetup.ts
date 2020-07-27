import * as socketio from "socket.io";
import log from "../helpers/logger";

module.exports = (io, webinarCache) => {
  io.on("connection", (socket: socketio.Socket) => {
    let socketUserId = "";
    let socketWebinarId = "";
    log("connection", `${socket.client.id}`);

    socket.on("new-user", (data: { webinarID: string; userID: string }) => {
      const { userID, webinarID } = data;
      if (!userID || !webinarID) {
        return log("alert", "Invalid socket connection received");
      }
      socketUserId = userID;
      socketWebinarId = webinarID;

      if (!(webinarID in webinarCache)) {
        socket.emit("webinar-error", "Webinar not in cache");
        log("error", "Invalid webinarID received");
      }
      socket.join(`${webinarID}`);

      webinarCache[webinarID].users[userID] = socket;
    });

    socket.on("disconnect", () => {
      log("disconnect", `${socketUserId}`);
      delete webinarCache[socketWebinarId].users[socketUserId];
    });
  });
};
