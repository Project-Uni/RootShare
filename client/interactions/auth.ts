import { PhoneVerification, University, User } from '../rootshare_db/models';
import {
  generateJWT,
  hashPassword,
  comparePasswords,
  log,
  sendPacket,
} from '../helpers/functions';
import { StateCodeKeys, EmailRegex } from '../helpers/constants';
import { Encryption } from '../helpers/modules';
export class AuthService {
  login = async ({ email, password }: { email: string; password: string }) => {
    try {
      const validation_user = await User.model
        .findOne({ email: { $regex: email, $options: 'i' } }, ['hashedPassword'])
        .lean()
        .exec();
      if (!validation_user)
        return {
          status: 400,
          packet: sendPacket(0, 'Invalid credentials'),
        };

      if (!comparePasswords(password, validation_user.hashedPassword))
        return { status: 400, packet: sendPacket(0, 'Invalid credentials') };

      const [user] = await User.getUsersByIDs([validation_user._id], {
        fields: [
          'firstName',
          'lastName',
          'accountType',
          'university',
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
      const userExists = await User.model.exists({
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
      const newUser = await new User.model({
        email: email.toLowerCase().trim(),
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
            university: newUser.university,
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
    if (email && !AuthService.validators.isValidEmail(email)) errors.push('email');
    if (password && !AuthService.validators.isValidPassword(password))
      errors.push('password');
    if (phoneNumber && !AuthService.validators.isValidPhoneNumber(phoneNumber))
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
      !AuthService.validators.isValidGraduationYear({ accountType, graduationYear })
    )
      errors.push('graduationYear');
    if (firstName && firstName.trim().length === 0) errors.push('firstName');
    if (lastName && lastName.trim().length === 0) errors.push('lastName');
    if (state && !AuthService.validators.isValidState(state)) errors.push('state');
    if (university && !AuthService.validators.isValidUniversity(university))
      errors.push('university');
    return errors;
  };

  private static validators = {
    isValidEmail: (email: string) => EmailRegex.test(email),
    isValidPassword: (password: string) =>
      password.length >= 8 && password !== 'password',
    isValidPhoneNumber: (phoneNumber: string) =>
      /^\d+$/.test(phoneNumber) && phoneNumber.length === 10,
    isValidState: (state: string) =>
      StateCodeKeys.some((stateCode) => stateCode === state),
    isValidUniversity: async (universityID: string) =>
      await University.model.exists({ _id: universityID }),
    isValidGraduationYear: async ({
      accountType,
      graduationYear,
    }: {
      accountType: 'student' | 'alumni' | 'faculty' | 'recruiter';
      graduationYear: number;
    }) => {
      const currentYear = new Date().getFullYear();
      switch (accountType) {
        case 'student':
          return graduationYear >= currentYear && graduationYear <= currentYear + 6;
        case 'alumni':
        case 'faculty':
        case 'recruiter':
          return graduationYear <= currentYear && graduationYear >= 1930;
        default:
          return false;
      }
    },
  };
}
