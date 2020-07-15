import jwt = require('jsonwebtoken');
import sendPacket from '../../helpers/sendPacket';

export function isAuthenticated(req, res, next) {
  // If the user is logged in, continue with the request to the restricted route
  if (req.isAuthenticated()) {
    return next();
  }
  // Send response to the frontend telling them they aren't authenticated
  // and display the login page to them
  return res.json(sendPacket(-1, 'Request not authorized'));
}

export function isAuthenticatedWithJWT(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  try {
    jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch {
    return res.json(sendPacket(-1, 'Invalid access token'));
  }

  if (req.isAuthenticated()) return next();

  return res.json(sendPacket(-1, 'Request not authorized'));
}
