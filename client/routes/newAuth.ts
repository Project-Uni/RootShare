import { Express } from 'express';
import sendPacket from '../../webinar/helpers/sendPacket';
import { isAuthenticatedWithJWT } from '../../webinar/middleware/isAuthenticated';
import { generateJWT, hashPassword } from '../helpers/functions';
import { User } from '../models';
import {} from '../models/users';

export const authRoutes = (app: Express) => {
  app.get('/api/v2/auth/validate', async (req, res) => {});

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

    // if (!isValidEmail(email))
    //   return res.status(400).json(sendPacket(-1, 'Email address not valid'));

    // if (!isValidPassword(password))
    //   return res.status(400).json(sendPacket(-1, 'Invalid Password'));

    try {
      const userExists = await User.exists({
        email: { $regex: email, $options: 'i' },
      });
      if (userExists)
        return res
          .status(400)
          .json(sendPacket(0, 'Account with this email already exists'));

      const newUser = await new User({
        email: email.toLowerCase(),
        phoneNumber,
        hashedPassword: hashPassword(password),
      }).save();

      //Generate JWT
      const { accessToken, refreshToken } = generateJWT({
        email: email.toLowerCase(),
        _id: newUser._id,
        privilegeLevel: 1,
        firstName: '',
        lastName: '',
        accountType: '',
      });

      return res.status(200).json(
        sendPacket(1, 'Successfully registered user', {
          user: {
            firstName: '',
            lastName: '',
            email: email.toLowerCase(),
            accountType: '',
            privilegeLevel: 1,
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

  app.post('/api/v2/auth/login', async (req, res) => {});

  app.post(
    '/api/v2/auth/registration/complete',
    isAuthenticatedWithJWT,
    async (req, res) => {
      const { accountType, firstName, lastName };
    }
  );
};
