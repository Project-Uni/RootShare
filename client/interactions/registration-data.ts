var mongoose = require('mongoose')
var User = mongoose.model('users')
var University = mongoose.model('users')
import log from '../helpers/logger'

module.exports = {
  completeRegistrationDetails: (userData) => {
    let email = userData['email']
    User.findOne({ 'email': email },
      function (err, user) {
        if (err)
          log("MONGO ERROR", err)
        if (!user) {
          log("USER ERROR", 'User Not Found with email address ' + email);
        }

        // set the user's optional information
        user.graduationYear = userData['graduationYear']
        user.department = userData['department']
        user.major = userData['major']
        user.phoneNumber = userData['phoneNumber']
        user.organizations = userData['organizations']
        user.work = userData['work']
        user.position = userData['position']
        user.interests = userData['interests']
      }
    );
  },

  completeRegistrationRequired: (userData) => {
    let email = userData['email']
    User.findOne({ 'email': email },
      async function (err, user) {
        if (err)
          log("MONGO ERROR", err)
        if (!user) {
          log("USER ERROR", 'User Not Found with email address ' + email);
        }

        const university = await University.findOne({ 'universityName': userData['university'] });
        user.university = university
        user.accountType = userData['accountType']
      }
    );
  },

  userExists: async (email) => {
    let user = await User.findOne({ 'email': email })

    if (user) {
      return true
    } else {
      return false
    }
  }
}