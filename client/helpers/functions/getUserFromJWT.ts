import jwt = require('jsonwebtoken');

export const getUserFromJWT = (req) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  try {
    const user = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    return user;
  } catch (err) {
    return false;
  }
};
