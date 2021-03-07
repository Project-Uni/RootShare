import { sendSMS } from '../helpers/functions';

const mongoose = require('mongoose');
const { Schema } = mongoose;

const PhoneVerificationSchema = new Schema(
  {
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    code: { type: String, required: true },
    validUntil: { type: Date, required: true },
    validated: { type: Boolean, default: false },
  },
  { timestamps: true }
);

mongoose.model('phone_verifications', PhoneVerificationSchema);
const PhoneVerificationsModel = mongoose.model('phone_verifications');

export default class PhoneVerification {
  static model = PhoneVerificationsModel;

  static sendCode = async ({
    email,
    phoneNumber,
  }: {
    email: string;
    phoneNumber: string;
  }) => {
    const code = PhoneVerification.generateCode();

    const validUntil = new Date();
    validUntil.setMinutes(validUntil.getMinutes() + 5);

    try {
      await new PhoneVerification.model({
        email,
        phoneNumber,
        code,
        validUntil,
      }).save();

      if (await PhoneVerification.sendText({ phoneNumber, code })) return code;
      return false;
    } catch (err) {
      return false;
    }
  };

  private static generateCode = () => {
    let output = '';
    for (let i = 0; i < 6; i++) {
      const nextNum = Math.floor(Math.random() * 10).toString();
      output += nextNum;
    }
    return output;
  };

  static validate = async ({ email, code }: { email: string; code: string }) => {
    const isValidated = await PhoneVerification.model.exists({
      email,
      code,
      validUntil: { $gte: new Date() },
      validated: false,
    });
    if (isValidated) {
      await PhoneVerification.model
        .updateOne({ email, code }, { validated: true })
        .exec();
      return true;
    }
    return false;
  };

  private static sendText = async ({
    phoneNumber,
    code,
  }: {
    phoneNumber: string;
    code: string;
  }) => {
    const { success } = await sendSMS(
      [phoneNumber],
      `Your RootShare verification code is: ${code}`
    );
    return success === 1;
  };

  static resendCode = async ({
    email,
    phoneNumber,
  }: {
    email: string;
    phoneNumber: string;
  }) => {
    const entryExists = await PhoneVerification.model
      .exists({
        email,
        phoneNumber,
        validated: false,
      })
      .exec();
    if (entryExists) return false;

    const code = PhoneVerification.generateCode();
    const validUntil = new Date();
    validUntil.setMinutes(validUntil.getMinutes() + 5);
    try {
      await PhoneVerification.model
        .updateOne({ email, phoneNumber, validated: false }, { code, validUntil })
        .exec();
      return await PhoneVerification.sendText({ phoneNumber, code });
    } catch (err) {
      return false;
    }
  };
}
