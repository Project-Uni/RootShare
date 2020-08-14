import sendPacket from '../helpers/sendPacket';
import { isAuthenticatedWithJWT } from '../passport/middleware/isAuthenticated';

const { getUserData } = require('../interactions/utilities');

module.exports = (app) => {
  app.get('/api/adminCount', isAuthenticatedWithJWT, (req, res) => {
    getUserData((packet) => {
      res.json(packet);
    });
  });
};
