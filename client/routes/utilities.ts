import sendPacket from "../helpers/sendPacket";

const { getUserData } = require('../interactions/utilities')

module.exports = (app) => {
  app.get("/api/adminCount", (req, res) => {
    getUserData((packet) => {
      res.send(packet)
    })
  });
};
