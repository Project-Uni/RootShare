import * as crypto from 'crypto';

/**
 * Encryption module for password and future encryption needs
 * @description - Errors must be handled at time of use
 */
export class Encryption {
  static algorithm = 'aes-256-ctr';
  static secret = 'WoopidyScoopScoopeDeeWoopDeePoop';
  initializationVector: Buffer; //Randomly generated string used to increase protection of the encryption. IV must be present to decrypt a string

  constructor() {
    this.initializationVector = crypto.randomBytes(16);
  }

  encrypt = (text: string) => {
    const cipher = crypto.createCipheriv(
      Encryption.algorithm,
      Encryption.secret,
      this.initializationVector
    );

    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

    return {
      initializationVector: this.initializationVector.toString('hex'),
      encryptedMessage: encrypted.toString('hex'),
    };
  };

  decrypt = ({ iv, encryptedMessage }: { iv: string; encryptedMessage: string }) => {
    const decipher = crypto.createDecipheriv(
      Encryption.algorithm,
      Encryption.secret,
      Buffer.from(iv, 'hex')
    );

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedMessage, 'hex')),
      decipher.final(),
    ]);

    return decrypted.toString();
  };
}
