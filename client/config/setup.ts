const mongoose = require('mongoose');
const User = mongoose.model('users');

const localLogin = require('../passport/localLogin');
const localSignup = require('../passport/localSignup');
const linkedinLoginSignup = require('../passport/linkedinLoginSignup');
const googleLoginSignup = require('../passport/googleLoginSignup');

import { PassportStatic } from 'passport';

module.exports = function (passport: PassportStatic) {
  // Passport needs to be able to serialize and deserialize users to support persistent login sessions
  passport.serializeUser(function (user: { [key: string]: any }, done) {
    done(null, user._id);
  });

  passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });

  // Setting up Passport Strategies for Login and SignUp/Registration
  localLogin(passport);
  localSignup(passport);
  linkedinLoginSignup(passport);
  googleLoginSignup(passport);
};
