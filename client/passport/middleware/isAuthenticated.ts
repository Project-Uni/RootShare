import jwt = require('jsonwebtoken');

import {
  JWT_TOKEN_FIELDS,
  JWT_ACCESS_TOKEN_TIMEOUT,
} from '../../rootshare_db/types';
import { sendPacket } from '../../helpers/functions';

export function isAuthenticated(req, res, next) {
  // If the user is logged in, continue with the request to the restricted route
  if (req.isAuthenticated()) {
    return next();
  }
  // Send response to the frontend telling them they aren't authenticated
  // and display the login page to them
  return res.json(sendPacket(-1, 'Request not authorized'));
}

/**
 * @description Validates that the user is authenticated
 * @returns next middleware or function if authenticated
 */
export function isAuthenticatedWithJWT(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  try {
    jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch {
    return res.json(sendPacket(-1, 'Invalid access token'));
  }

  return next();
}
