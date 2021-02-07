import jwt = require('jsonwebtoken');

/**
 * @description Extracts the user from a valid access token
 * @param req HTTP Request
 * @returns User from token if successful, returns an object with empty user values if unsuccessful
 */
export const getUserFromJWT = (
  req
): {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  privilegeLevel: number;
  accountType: 'student' | 'alumni' | 'faculty' | 'fan';
} => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  try {
    const user: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
      privilegeLevel: number;
      accountType: 'student' | 'alumni' | 'faculty' | 'fan';
    } = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    return user;
  } catch (err) {
    return {
      _id: '',
      firstName: '',
      lastName: '',
      email: '',
      privilegeLevel: 0,
      accountType: 'fan',
    };
  }
};