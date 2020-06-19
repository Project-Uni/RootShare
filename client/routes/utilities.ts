import sendPacket from "../helpers/sendPacket";

const mongoose = require("mongoose");
const User = mongoose.model("users");

module.exports = (app) => {
  app.get("/api/adminCount", (req, res) => {
    User.find({}, ["firstName", "lastName", "createdAt"], (err, users) => {
      return res.json(sendPacket(1, "Found users", { users: users }));
    });
  });
};
