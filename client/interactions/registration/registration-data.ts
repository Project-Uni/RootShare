import { User, University } from '../../models';

import log from '../../helpers/logger';
import sendPacket from '../../helpers/sendPacket';

module.exports = {
  completeRegistrationDetails: async (userData, email) => {
    const user = await User.findOne({ email: email });
    if (!user || user === undefined || user === null) {
      log('USER ERROR', `User Not Found with email address: ${email}`);
      return sendPacket(0, 'Unable to find user.');
    }

    user.graduationYear = userData['graduationYear'];
    user.department = userData['department'];
    user.major = userData['major'];
    user.phoneNumber = userData['phoneNumber'];
    user.organizations = userData['organizations'];
    user.work = userData['work'];
    user.position = userData['position'];
    user.interests = userData['interests'];
    user.graduateSchool = userData['graduateSchool'];
    user.discoveryMethod = userData['discoveryMethod'];
    console.log(userData['discoveryMethod']);

    let outerErr = null;
    await user.save((err) => {
      if (err) outerErr = err;
    });

    if (outerErr) {
      return sendPacket(0, outerErr);
    } else {
      return sendPacket(1, 'Successfully updated user profile');
    }
  },

  completeRegistrationRequired: async (userData, email) => {
    const user = await User.findOne({ email: email });

    if (!user || user === undefined || user === null) {
      log('USER ERROR', `User Not Found with email address: ${email}`);
      return sendPacket(0, 'Unable to find user.');
    }

    const universityName = userData['university'];
    const university = await University.findOne({
      universityName: universityName,
    });

    if (!university || university === undefined || university === null) {
      log('USER ERROR', `University Not Found: ${universityName}`);
      return sendPacket(0, `Unable to find university: ${universityName}`);
    }

    user.university = university;
    user.accountType = userData['accountType'];

    let outerErr = null;
    await user.save((err) => {
      if (err) outerErr = err;
    });

    if (outerErr) {
      return sendPacket(0, outerErr);
    } else {
      return sendPacket(1, 'Successfully updated user profile');
    }
  },

  userExists: async (email) => {
    let user = await User.findOne({ email: email });

    if (!user || user === undefined || user === null) {
      return false;
    } else {
      return true;
    }
  },
};
