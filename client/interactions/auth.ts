import sendPacket from '../../webinar/helpers/sendPacket';
import { PhoneVerification, University, User } from '../models';
import { generateJWT, hashPassword, comparePasswords } from '../helpers/functions';
import { getUsersByIDs } from '../models/users';
import { log } from '../helpers/functions/logger';
import { StateCodeKeys } from '../helpers/constants/states';
import { Encryption } from '../helpers/modules';
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
    const errors = AuthService.validateFields({ email, password, phoneNumber });
    if (errors.length > 0)
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

      let encryptedData: { initializationVector: string; encryptedMessage: string };
      try {
        encryptedData = new Encryption().encrypt(password);
      } catch (err) {
        return { status: 400, packet: sendPacket(-1, 'Failed to encrypt password') };
      }

      const {
        initializationVector,
        encryptedMessage: encryptedPassword,
      } = encryptedData;
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
        packet: sendPacket(1, 'New account information is valid', {
          initializationVector,
          encryptedPassword,
        }),
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
    initializationVector,
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
    initializationVector: string;
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
      !initializationVector ||
      !accountType ||
      !firstName ||
      !lastName ||
      !graduationYear ||
      !state ||
      !university
    )
      return { status: 400, packet: sendPacket(-1, 'Missing body parameters') };

    if ((accountType === 'alumni' || accountType === 'recruiter') && !company)
      return { status: 400, packet: sendPacket(-1, 'Missing body parameters') };
    else if (accountType === 'student' && !major)
      return { status: 400, packet: sendPacket(-1, 'Missing body parameters') };
    else if (accountType === 'faculty' && !jobTitle)
      return { status: 400, packet: sendPacket(-1, 'Missing body parameters') };

    let decryptedPassword: string;
    try {
      decryptedPassword = new Encryption().decrypt({
        iv: initializationVector,
        encryptedMessage: password,
      });
    } catch (err) {
      return { status: 400, packet: sendPacket(-1, 'Failed to decrypt password') };
    }

    const errors = AuthService.validateFields({
      email,
      password: decryptedPassword,
      phoneNumber,
      firstName,
      lastName,
      accountType,
      graduationYear,
      state,
      university,
    });
    if (errors.length > 0)
      return {
        status: 400,
        packet: sendPacket(0, 'Invalid input fields', { errors }),
      };

    if (!(await PhoneVerification.isValidated({ email, phoneNumber })))
      return {
        status: 400,
        packet: sendPacket(0, 'Phone number has not been validated'),
      };

    try {
      const newUser = await new User({
        email: email.toLowerCase(),
        phoneNumber,
        hashedPassword: hashPassword(decryptedPassword),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        accountType,
        major: major.trim(),
        position: jobTitle.trim(),
        work: company.trim(),
        graduationYear,
        state,
        university,
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
    return /^\d+$/.test(phoneNumber) || phoneNumber.length !== 10;
  };

  private static isValidState = (state: string) => {
    return StateCodeKeys.some((stateCode) => stateCode === state);
  };

  private static isValidUniversity = async (universityID: string) => {
    return await University.exists({ _id: universityID });
  };

  private static isValidGraduationYear = async ({
    accountType,
    graduationYear,
  }: {
    accountType: 'student' | 'alumni' | 'faculty' | 'recruiter';
    graduationYear: number;
  }) => {
    const currentYear = new Date().getFullYear();
    switch (accountType) {
      case 'student':
        return graduationYear >= currentYear && graduationYear <= currentYear + 5;
      case 'alumni':
      case 'faculty':
      case 'recruiter':
        return graduationYear <= currentYear && graduationYear >= 1930;
      default:
        return false;
    }
  };

  private static validateFields = ({
    email,
    password,
    phoneNumber,
    accountType,
    graduationYear,
    firstName,
    lastName,
    state,
    university,
  }: {
    email?: string;
    password?: string;
    phoneNumber?: string;
    accountType?: 'student' | 'alumni' | 'faculty' | 'recruiter';
    graduationYear?: number;
    firstName?: string;
    lastName?: string;
    state?: string;
    university?: string;
  }) => {
    let errors = [];
    if (email && !AuthService.isValidEmail(email)) errors.push('email');
    if (password && !AuthService.isValidPassword(password)) errors.push('password');
    if (phoneNumber && !AuthService.isValidPhoneNumber(phoneNumber))
      errors.push('phoneNumber');
    if (
      accountType &&
      accountType !== 'student' &&
      accountType !== 'alumni' &&
      accountType !== 'faculty' &&
      accountType !== 'recruiter'
    )
      errors.push('accountType');
    if (
      graduationYear &&
      !AuthService.isValidGraduationYear({ accountType, graduationYear })
    )
      errors.push('graduationYear');
    if (firstName && firstName.trim().length === 0) errors.push('firstName');
    if (lastName && lastName.trim().length === 0) errors.push('lastName');
    if (state && !AuthService.isValidState(state)) errors.push('state');
    if (university && !AuthService.isValidUniversity(university))
      errors.push('university');
    return errors;
  };
}
