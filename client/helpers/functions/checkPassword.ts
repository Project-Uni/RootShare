var bCrypt = require('bcryptjs');

// Generates hash using bCrypt
export function hashPassword(password) {
  return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}

export function isValidPassword(user, password) {
  // if (password === user.hashedPassword) {
  //   return true;
  // }

  return bCrypt.compareSync(password, user.hashedPassword);
}
