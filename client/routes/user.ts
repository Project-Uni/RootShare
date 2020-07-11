import { getCurrentUser, getConnections } from '../interactions/user';

module.exports = (app) => {
  app.get('/user/getCurrent', (req, res) => {
    getCurrentUser(req.user, (packet) => res.send(packet));
  });

  app.get('/user/getConnections', (req, res) => {
    getConnections(req.user, (packet) => res.send(packet));
  });
};
