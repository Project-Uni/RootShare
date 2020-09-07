import { JWT_TOKEN_FIELDS, JWT_ACCESS_TOKEN_TIMEOUT } from '../types/types';
import jwt = require('jsonwebtoken');

export function generateJWT(user) {
  const userTokenInfo = {};
  for (let i = 0; i < JWT_TOKEN_FIELDS.length; i++)
    userTokenInfo[JWT_TOKEN_FIELDS[i]] = user[JWT_TOKEN_FIELDS[i]];
  const accessToken = jwt.sign(
    userTokenInfo,
    process.env.JWT_ACCESS_SECRET
    // { expiresIn: JWT_ACCESS_TOKEN_TIMEOUT }
  );
  const refreshToken = jwt.sign(userTokenInfo, process.env.JWT_REFRESH_SECRET);

  const JWT = {
    accessToken,
    refreshToken,
  };

  return JWT;
}
