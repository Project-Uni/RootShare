const Cryptr = require('cryptr');
const { CRYPT_SECRET } = require('../../../keys/keys.json');
const cryptr = new Cryptr(CRYPT_SECRET);

export function convertEmailToToken(emailAddress) {
  let token = cryptr.encrypt(emailAddress);
  return token;
}

export function convertTokenToEmail(emailToken) {
  let emailAddress;
  try {
    emailAddress = cryptr.decrypt(emailToken);
    emailAddress = emailAddress.toString().toLowerCase();
    return emailAddress;
  } catch {
    return null;
  }
}
