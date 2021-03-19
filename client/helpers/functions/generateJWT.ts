import {
  JWT_TOKEN_FIELDS,
  JWT_ACCESS_TOKEN_TIMEOUT,
} from '../../rootshare_db/types';
import jwt = require('jsonwebtoken');
import { Types } from 'mongoose';

export function generateJWT(
  user: {
    [key in typeof JWT_TOKEN_FIELDS[number]]: string | number | Types.ObjectId;
  }
): { accessToken: string; refreshToken: string } {
  const userTokenInfo = {};
  for (let i = 0; i < JWT_TOKEN_FIELDS.length; i++)
    userTokenInfo[JWT_TOKEN_FIELDS[i]] = user[JWT_TOKEN_FIELDS[i]];
  const accessToken: string = jwt.sign(
    userTokenInfo,
    process.env.JWT_ACCESS_SECRET
    // { expiresIn: JWT_ACCESS_TOKEN_TIMEOUT }
  );
  const refreshToken: string = jwt.sign(
    userTokenInfo,
    process.env.JWT_REFRESH_SECRET
  );

  const JWT = {
    accessToken,
    refreshToken,
  };

  return JWT;
}
