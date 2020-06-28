import sendPacket from "../helpers/sendPacket";
var mongoose = require('mongoose');
var User = mongoose.model('users');

const { getUserData } = require('../interactions/utilities');

module.exports = (app) => {
  app.get("/api/adminCount", (req, res) => {
    getUserData((packet) => {
      res.send(packet);
    });
  });

  app.get('/api/mockLogin', async (req, res) => {
    //ASHWIN - Add check here to see if running if dev, if not, return -1

    const user = await User.findOne({ email: 'mahesh2@purdue.edu' });
    req.login(user, (err) => {
      if (err) return res.json(sendPacket(-1, 'Failed to login mock user'));
      return res.json(sendPacket(1, 'Successfully logged in to mock user', { firstName: user.firstName, lastName: user.lastName, email: user.email, _id: user._id }));
    });
  });
};
