import jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // If the user is logged in, continue with the request to the restricted route
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  try {
    jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch {
    return res.json({ success: -1, message: 'Invalid access token' });
  }

  if (req.isAuthenticated()) {
    return next();
  }
  // Send response to the frontend telling them they aren't authenticated
  // and display the login page to them
  return res.json('NOAUTH');
};
