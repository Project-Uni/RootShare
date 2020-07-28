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
  });
};
