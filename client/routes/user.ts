import sendPacket from '../helpers/sendPacket';

module.exports = (app) => {
  app.get('/user/getCurrent', (req, res) => {
    const user = req.user;
    if (!user) return res.json(sendPacket(0, 'User not found'));
    return res.json(
      sendPacket(1, 'Found currentUser', {
        email: user.email,
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        privilegeLevel: user.privilegeLevel || 1,
        accountType: user.accountType,
      })
    );
  });
};
