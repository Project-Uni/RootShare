import { hashSync, compareSync, genSaltSync } from 'bcryptjs';

export function hashPassword(password) {
  return hashSync(password, genSaltSync(10));
}

export const comparePasswords = (rawPassword, hashedPassword) => {
  return compareSync(rawPassword, hashedPassword);
};
