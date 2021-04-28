import sendPacket from '../helpers/sendPacket';
import jwt = require('jsonwebtoken');
import { JWT_TOKEN_FIELDS, JWT_ACCESS_TOKEN_TIMEOUT } from '../types/constants';

export function isAuthenticatedWithJWT(req, res, next) {
  const reqUser_raw = req.headers['user'];
  if (!reqUser_raw) return res.json(sendPacket(0, 'User not logged in'));

  const reqUser = JSON.parse(reqUser_raw);

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  let user;
  try {
    user = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch {
    return res.json(sendPacket(-1, 'Invalid access token'));
  }

  return next();
}
