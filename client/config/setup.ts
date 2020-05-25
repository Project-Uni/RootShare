import { link } from "fs"

var mongoose = require('mongoose')
var User = mongoose.model('users')

var localLogin = require('../passport/localLogin')
var localSignup = require('../passport/localSignup')
var linkedinLoginSignup = require('../passport/linkedinLoginSignup')

module.exports = function (passport) {

  // Passport needs to be able to serialize and deserialize users to support persistent login sessions
  passport.serializeUser(function (user, done) {
    // console.log('serializing user: '); console.log(user)
    done(null, user._id)
  });

  passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
      // console.log('deserializing user:', user)
      done(err, user)
    });
  });

  // Setting up Passport Strategies for Login and SignUp/Registration
  localLogin(passport)
  localSignup(passport)
  linkedinLoginSignup(passport)
}