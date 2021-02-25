import sendPacket from '../../webinar/helpers/sendPacket';
import { PhoneVerification, User } from '../models';
import { generateJWT, hashPassword, comparePasswords } from '../helpers/functions';
import { getUsersByIDs } from '../models/users';
import { log } from '../helpers/functions/logger';
import { StateCodeKeys } from '../helpers/constants/states';

export class AuthService {
  login = async ({ email, password }: { email: string; password: string }) => {
    try {
      const validation_user = await User.findOne(
        { email: { $regex: email, $options: 'i' } },
        ['hashedPassword']
      )
        .lean()
        .exec();
      if (!validation_user)
        return {
          status: 400,
          packet: sendPacket(0, 'No user exists with this email'),
        };

      if (!comparePasswords(password, validation_user.hashedPassword))
        return { status: 400, packet: sendPacket(0, 'Invalid password') };

      const [user] = await getUsersByIDs([validation_user._id], {
        fields: [
          'firstName',
          'lastName',
          'accountType',
          'privilegeLevel',
          'profilePicture',
        ],
        options: {
          includeDefaultFields: false,
          getProfilePicture: true,
          limit: 1,
        },
      });

      const { accessToken, refreshToken } = generateJWT(user);

      return {
        status: 200,
        packet: sendPacket(1, 'Successfully logged in', {
          user,
          accessToken,
          refreshToken,
        }),
      };
    } catch (err) {
      return {
        status: 500,
        packet: sendPacket(-1, 'There was an error searching for the user'),
      };
    }
  };

  validateRegistration = async ({
    email,
    password,
    phoneNumber,
  }: {
    email: string;
    password: string;
    phoneNumber: string;
  }) => {
    if (AuthService.validateFields({ email, password, phoneNumber }))
      return { status: 400, packet: sendPacket(-1, 'Inputs are invalid') };

    try {
      const userExists = await User.exists({
        email: { $regex: email, $options: 'i' },
      });
      if (userExists)
        return {
          status: 400,
          packet: sendPacket(0, 'Account with this email already exists'),
        };

      const code = await PhoneVerification.sendCode({
        email: email as string,
        phoneNumber: phoneNumber as string,
      });
      if (!code)
        return {
          status: 500,
          packet: sendPacket(
            -1,
            'There was an error while sending SMS Verification code'
          ),
        };

      return {
        status: 200,
        packet: sendPacket(1, 'New account information is valid'),
      };
    } catch (err) {
      log('error', err.message);
      return {
        status: 500,
        packet: sendPacket(-1, 'There was an error validating the user'),
      };
    }
  };

  register = async ({
    email,
    phoneNumber,
    password,
    accountType,
    firstName,
    lastName,
    major,
    company,
    jobTitle,
    university,
    graduationYear,
    state,
  }: {
    email: string;
    phoneNumber: string;
    password: string;
    accountType: 'student' | 'alumni' | 'faculty' | 'recruiter';
    firstName: string;
    lastName: string;
    company?: string;
    jobTitle?: string;
    major?: string;
    university?: any; //TBD Decide how to do this as we add more universities,
    graduationYear: number;
    state: string;
  }) => {
    if (
      !email ||
      !phoneNumber ||
      !password ||
      !accountType ||
      !firstName ||
      !lastName ||
      !graduationYear ||
      !state
    )
      return { status: 400, packet: sendPacket(-1, 'Missing body parameters') };

    if ((accountType === 'alumni' || accountType === 'recruiter') && !company)
      return { status: 400, packet: sendPacket(-1, 'Missing body parameters') };
    else if (accountType === 'student' && !major)
      return { status: 400, packet: sendPacket(-1, 'Missing body parameters') };
    else if (accountType === 'faculty' && !jobTitle)
      return { status: 400, packet: sendPacket(-1, 'Missing body parameters') };

    if (
      AuthService.validateFields({
        email,
        password,
        phoneNumber,
        firstName,
        lastName,
        accountType,
        state,
      })
    )
      return { status: 400, packet: sendPacket(0, 'Invalid input fields') };

    try {
      const newUser = await new User({
        email: email.toLowerCase(),
        phoneNumber,
        hashedPassword: hashPassword(password),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        accountType,
        major: major.trim(),
        position: jobTitle.trim(),
        work: company.trim(),
        graduationYear,
        state,
      }).save();

      const { accessToken, refreshToken } = generateJWT({
        email: email.toLowerCase(),
        _id: newUser._id,
        privilegeLevel: 1,
        firstName: firstName,
        lastName: lastName,
        accountType: accountType,
      });

      return {
        status: 200,
        packet: sendPacket(1, 'Successfully registered user', {
          user: {
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            email: newUser.email,
            accountType: newUser.accountType,
            privilegeLevel: newUser.privilegeLevel,
          },
          accessToken,
          refreshToken,
        }),
      };
    } catch (err) {
      return {
        status: 500,
        packet: sendPacket(-1, 'There was an error while trying to create the user'),
      };
    }
  };

  verify = async ({ code, email }: { code: string; email: string }) => {
    if (!code || !email)
      return { status: 400, packet: sendPacket(-1, 'Missing body params') };

    const validated = await PhoneVerification.validate({ email, code });
    if (!validated) return { status: 400, packet: sendPacket(-1, 'Invalid code') };

    //Update user DB
    return { status: 200, packet: sendPacket(1, 'Successfully verified account') };
  };

  resendPhoneVerification = async ({
    phoneNumber,
    email,
  }: {
    email: string;
    phoneNumber: string;
  }) => {
    if (!email || !phoneNumber)
      return { status: 400, packet: sendPacket(1, 'Missing body params') };

    const success = await PhoneVerification.resendCode({ email, phoneNumber });
    if (!success)
      return {
        status: 500,
        packet: sendPacket(-1, 'Failed to resend verification code'),
      };

    return {
      status: 200,
      packet: sendPacket(1, 'Successfully sent verification code'),
    };
  };

  private static isValidEmail = (email: string) => {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  };

  private static isValidPassword = (password: string) => {
    return password.length >= 8 && password !== 'password';
  };

  private static isValidPhoneNumber = (phoneNumber: string) => {
    return !/^\d+$/.test(phoneNumber) || phoneNumber.length !== 10;
  };

  private static isValidState = (state: string) => {
    return StateCodeKeys.some((stateCode) => stateCode === state);
  };

  private static validateFields = ({
    email,
    password,
    phoneNumber,
    accountType,
    firstName,
    lastName,
    state,
  }: {
    email?: string;
    password?: string;
    phoneNumber?: string;
    accountType?: 'student' | 'alumni' | 'faculty' | 'recruiter';
    firstName?: string;
    lastName?: string;
    state?: string;
  }) => {
    let isValid = true;
    if (email && !AuthService.isValidEmail(email)) isValid = false;
    if (password && !AuthService.isValidPassword(password)) isValid = false;
    if (phoneNumber && !AuthService.isValidPhoneNumber(phoneNumber)) isValid = false;
    if (
      accountType &&
      accountType !== 'student' &&
      accountType !== 'alumni' &&
      accountType !== 'faculty' &&
      accountType !== 'recruiter'
    )
      isValid = false;
    if (firstName && firstName.trim().length === 0) isValid = false;
    if (lastName && lastName.trim().length === 0) isValid = false;
    if (state && !AuthService.isValidState(state)) isValid = false;
    return isValid;
  };
}
