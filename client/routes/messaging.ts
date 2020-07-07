import sendPacket from "../helpers/sendPacket";
var mongoose = require("mongoose");
var User = mongoose.model("users");

const isAuthenticated = require("../passport/middleware/isAuthenticated");
const {
  createThread,
  sendMessage,
  getLatestThreads,
  getLatestMessages,
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

  app.post("/api/messaging/getLatestMessages", isAuthenticated, (req, res) => {
    getLatestMessages(req.user._id, req.body.conversationID, (packet) => {
      res.send(packet);
    });
  });

  app.get("/api/mockLogin", async (req, res) => {
    const user = await User.findOne({ email: "smitdesai422@gmail.com" });
    req.login(user, (err) => {
      if (err) return res.json(sendPacket(-1, "Failed to login mock user"));
      return res.json(
        sendPacket(1, "Successfully logged in to mock user", {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          _id: user._id,
        })
      );
    });
  });
};
