const GoogleStrategy = require("passport-google-oath20").Strategy;
const mongoose = require("mongoose");
const User = mongoose.model("users");

import log from "../helpers/logger";

module.exports = (passport) => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: "Test",
        clientSecret: "Test",
        callbackURL: "/auth/google/callback",
        userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
        proxy: true,
      },
      (_, _2, profile, done) => {
        User.findOne({ userid: profile.emails[0].value }).then(
          (existingUser) => {
            if (existingUser) {
              log("login", `${profile.emails[0].value} logged in with Google.`);
              done(null, existingUser);
            } else {
              log(
                "login",
                `Creating new user with email: ${profile.emails[0].value}`
              );
              // new User({ username: email });
              console.log("Google User:", profile);
              done(null, profile);
            }
          }
        );
      }
    )
  );
};
