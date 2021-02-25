import sendPacket from '../../webinar/helpers/sendPacket';
import { PhoneVerification, User } from '../models';
import {
  generateJWT,
  hashPassword,
  getQueryParams,
  comparePasswords,
} from '../helpers/functions';
import { getUsersByIDs } from '../models/users';

export class AuthService {
  static login = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
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
}
