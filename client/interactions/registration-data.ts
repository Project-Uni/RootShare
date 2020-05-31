var mongoose = require("mongoose");
var User = mongoose.model("users");
var University = mongoose.model("users");
import log from "../helpers/logger";
import sendPacket from "../helpers/sendPacket";

module.exports = {
  completeRegistrationDetails: (userData) => {
    let email = userData["email"];

    User.findOne({ email: email }, function (err, user) {
      if (err) {
        log("MONGO ERROR", err);
        return sendPacket(-1, "Error with mongoDB");
      }
      if (!user) {
        log("USER ERROR", "User Not Found with email address " + email);
        return sendPacket(0, "Unable to find this user.");
      }

      // set the user's optional information
      user.graduationYear = userData["graduationYear"];
      user.department = userData["department"];
      user.major = userData["major"];
      user.phoneNumber = userData["phoneNumber"];
      user.organizations = userData["organizations"];
      user.work = userData["work"];
      user.position = userData["position"];
      user.interests = userData["interests"];
      user.regComplete = true;

      user.save((err) => {
        if (err) {
          return sendPacket(0, "Unable to update user details");
        }
        return sendPacket(1, "Successfully updated user profile");
      });
    });
  },

  completeRegistrationRequired: async (userData) => {
    let email = userData["email"];
    const user = await User.findOne({ email: email });
    if (!user) {
      log("USER ERROR", "User Not Found with email address " + email);
      return sendPacket(0, "Unable to find user.");
    }
    const university = await University.findOne({
      universityName: userData["university"],
    });
    user.university = university;
    user.accountType = userData["accountType"];

    await user.save((err) => {
      if (err) return sendPacket(0, "Unable to update user details");
    });
    return sendPacket(1, "Successfully updated user profile");
  },

  userExists: async (email) => {
    let user = await User.findOne({ email: email });

    if (user) {
      return true;
    } else {
      return false;
    }
  },
};
