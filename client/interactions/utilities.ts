import sendPacket from "../helpers/sendPacket";

const mongoose = require("mongoose");
const User = mongoose.model("users");

module.exports = {
  getUserData: (callback) => {
    User.find({}, ["firstName", "lastName", "createdAt", "accountType"], (err, users) => {
      if (err) {
        return callback(sendPacket(-1, "Could not find users"))
      }

      const numStudents = module.exports.countAccountType(users, 'student')
      const numAlumni = module.exports.countAccountType(users, 'alumni')
      const numFaculty = module.exports.countAccountType(users, 'faculty')
      const numFans = module.exports.countAccountType(users, 'fan')
      return callback(sendPacket(1, "Found users",
        {
          users,
          numStudents,
          numAlumni,
          numFaculty,
          numFans
        }))
    });
  },

  countAccountType: (users, accountType) => {
    let count = 0
    for (let i = 0; i < users.length; i++) {
      const userAccountType = users[i].accountType
      if (accountType.localeCompare(userAccountType) === 0) {
        count++
      }
    }

    return count
  }
}