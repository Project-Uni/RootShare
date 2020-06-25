import sendPacket from "../helpers/sendPacket";

const isAuthenticated = require("../passport/middleware/isAuthenticated");
const {
  createThread,
  sendMessage,
  getLatestThreads,
} = require("../interactions/messaging");

module.exports = (app) => {
  app.post("/api/messaging/sendMessage", isAuthenticated, (req, res) => {
    sendMessage(
      req.user._id,
      req.body.conversationID,
      req.body.message,
      (packet) => {
        res.send(packet);
      }
    );
  });

  app.post("/api/messaging/createThread", isAuthenticated, (req, res) => {
    createThread(req, (packet) => {
      res.send(packet);
    });
  });

  app.get("/api/messaging/getLatestThreads", isAuthenticated, (req, res) => {
    getLatestThreads(req.user._id, (packet) => {
      res.send(packet);
    });
  });
};
