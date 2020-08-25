import jwt = require('jsonwebtoken');
import { sendPacket } from '../../helpers/functions';
import { JWT_TOKEN_FIELDS, JWT_ACCESS_TOKEN_TIMEOUT } from '../../helpers/types';

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
  if (!req.user) return res.json(sendPacket(0, 'User not logged in'));

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  let user;
  try {
    user = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch {
    return res.json(sendPacket(-1, 'Invalid access token'));
  }
  //JWT Auth, checking if user info in request matches JWT
  for (let i = 0; i < JWT_TOKEN_FIELDS.length; i++) {
    const tokenValue = user[JWT_TOKEN_FIELDS[i]].toString();
    const requestValue = req.user[JWT_TOKEN_FIELDS[i]].toString();
    if (tokenValue != requestValue)
      return res.json(sendPacket(-1, 'Invalid access token'));
  }

  if (req.isAuthenticated()) return next();

  return res.json(sendPacket(-1, 'Request not authorized'));
}
