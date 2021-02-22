import { Express } from 'express';
import { send } from 'process';
import sendPacket from '../../webinar/helpers/sendPacket';
import { isAuthenticatedWithJWT } from '../../webinar/middleware/isAuthenticated';
import {
  generateJWT,
  hashPassword,
  getQueryParams,
  comparePasswords,
} from '../helpers/functions';
import { User } from '../models';
import { getUsersByIDs } from '../models/users';

export const authRoutes = (app: Express) => {
  app.get('/api/v2/auth/validate', async (req, res) => {
    const query = getQueryParams(req, {
      email: { type: 'string' },
      phoneNumber: { type: 'string' },
      password: { type: 'string' },
    });
    if (!query) return res.status(400).json(sendPacket(-1, 'Missing query params'));

    const { email, password, phoneNumber } = query;
    // if (!isValidEmail(email))
    //   return res.status(400).json(sendPacket(-1, 'Email address not valid'));

    // if (!isValidPassword(password))
    //   return res.status(400).json(sendPacket(-1, 'Invalid Password'));

    // if (!isValidPhoneNumber(phoneNumber))
    //   return res.status(500).json(sendPacket(-1, 'Invalid phone number'));
    try {
      const userExists = await User.exists({
        email: { $regex: email, $options: 'i' },
      });
      if (userExists)
        res
          .status(400)
          .json(sendPacket(0, 'Account with this email already exists'));
      else res.status(200).json(sendPacket(1, 'New account information is valid'));
    } catch (err) {
      res.status(500).json(sendPacket(-1, 'There was an error validating the user'));
    }
  });

  app.post('/api/v2/auth/register', async (req, res) => {
    const {
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
    } = req.body;
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
      return res.status(400).json(sendPacket(-1, 'Missing body parameters'));

    if ((accountType === 'alumni' || accountType === 'recruiter') && !company)
      return res.status(400).json(sendPacket(-1, 'Missing body parameters'));
    else if (accountType === 'student' && !major)
      return res.status(400).json(sendPacket(-1, 'Missing body parameters'));
    else if (accountType === 'faculty' && !jobTitle)
      return res.status(400).json(sendPacket(-1, 'Missing body parameters'));

    try {
      const newUser = await new User({
        email: email.toLowerCase(),
        phoneNumber,
        hashedPassword: hashPassword(password),
        firstName,
        lastName,
        accountType,
        major,
        position: jobTitle,
        work: company,
        graduationYear,
        // state
      }).save();

      const { accessToken, refreshToken } = generateJWT({
        email: email.toLowerCase(),
        _id: newUser._id,
        privilegeLevel: 1,
        firstName: firstName,
        lastName: lastName,
        accountType: accountType,
      });

      return res.status(200).json(
        sendPacket(1, 'Successfully registered user', {
          user: {
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            email: newUser.email,
            accountType: newUser.accountType,
            privilegeLevel: newUser.privilegeLevel,
          },
          accessToken,
          refreshToken,
        })
      );
    } catch (err) {
      return res
        .status(500)
        .json(sendPacket(-1, 'There was an error while trying to create the user'));
    }
  });

  app.post('/api/v2/auth/login', async (req, res) => {
    const { email, password }: { email: string; password: string } = req.body;
    try {
      const validation_user = await User.findOne(
        {
          email: { $regex: email, $options: 'i' },
        },
        ['hashedPassword']
      )
        .lean()
        .exec();

      if (!validation_user)
        return res.status(400).json(sendPacket(0, 'No user exists with this email'));

      if (!comparePasswords(password, validation_user.hashedPassword))
        return res.status(400).json(sendPacket(0, 'Invalid password'));

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

      console.log('User:', user);

      const { accessToken, refreshToken } = generateJWT(user);

      return res.status(200).json(
        sendPacket(1, 'Successfully logged in', {
          user,
          accessToken,
          refreshToken,
        })
      );
    } catch (err) {
      return res.status(400).json(sendPacket(0, 'Failed to find user'));
    }
  });
};
