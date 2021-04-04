import jwt = require('jsonwebtoken');
import { Types } from 'mongoose';

import { AccountType } from '../../rootshare_db/types';

const ObjectIdVal = Types.ObjectId;
type ObjectIdType = Types.ObjectId;

/**
 * @description Extracts the user from a valid access token
 * @param req HTTP Request
 * @returns User from token if successful, returns an object with empty user values if unsuccessful
 */
export const getUserFromJWT = (
  req
): {
  _id: ObjectIdType;
  firstName: string;
  lastName: string;
  email: string;
  privilegeLevel: number;
  accountType: AccountType;
} => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  try {
    const rawUser = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    rawUser._id = ObjectIdVal(rawUser._id);
    const user: {
      _id: ObjectIdType;
      firstName: string;
      lastName: string;
      email: string;
      privilegeLevel: number;
      accountType: AccountType;
    } = rawUser;
    return user;
  } catch (err) {
    return {
      _id: ObjectIdVal(''),
      firstName: '',
      lastName: '',
      email: '',
      privilegeLevel: 0,
      accountType: 'student',
    };
  }
};
