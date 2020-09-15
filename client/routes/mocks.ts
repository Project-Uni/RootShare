import { sendPacket } from '../helpers/functions';
import { User } from '../models';

const MOCK_LOGIN_EMAIL = 'mahesh2@purdue.edu';

module.exports = (app) => {
  app.get('/api/mockLogin', async (req, res) => {
    if (process.env.NODE_ENV && process.env.NODE_ENV === 'dev') {
      const user = await User.findOne({ email: MOCK_LOGIN_EMAIL });
      if (!user || user === undefined || user === null)
        res.json(sendPacket(-1, 'Could not find user'));
      req.login(user, (err) => {
        if (err) return res.json(sendPacket(-1, 'Failed to login mock user'));
        return res.json(
          sendPacket(1, 'Successfully logged in to mock user', {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            _id: user._id,
          })
        );
      });
    } else return res.json(sendPacket(-1, 'Program not in dev'));
  });
};
