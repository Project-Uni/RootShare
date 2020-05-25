var mongoose = require('mongoose')
var User = mongoose.model('users')

module.exports = {
  completeRegistration: (userData) => {
    let email = userData['email']
    User.findOne({ 'email': email },
      function (err, user) {
        if (err)
          console.log(err)
        if (!user) {
          console.log('User Not Found with email address ' + email);
        }

        user.university = userData['university']
        user.accountType = userData['accountType']

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
  }
}