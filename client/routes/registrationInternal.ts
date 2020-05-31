var passport = require("passport");
const mongoose = require("mongoose");

var isAuthenticated = require("../passport/middleware/isAuthenticated");
var isConfirmed = require("./middleware/isConfirmed");
var {
  findUser,
  sendConfirmationEmail,
} = require("../interactions/email-confirmation");
var {
  completeRegistrationDetails,
  completeRegistrationRequired,
  userExists,
} = require("../interactions/registration-data");

var User = mongoose.model("users");

import sendPacket from "../helpers/sendPacket";
import log from "../helpers/logger";

module.exports = (app) => {
  app.post("/auth/login/local", (req, res) => {
    passport.authenticate("local-login", (err, user, info) => {
      if (user) {
        req.login(user, (err) => {
          if (err) {
            log("error", `Failed serializing ${user.email}`);
          }
          log("info", `Successfully logged in ${user.email} locally`);
          return res.redirect("/secure-confirmed");
        });
      } else if (info) {
        res.json(sendPacket(0, info.message));
        log("error", `User local login failed`);
      } else {
        res.json(sendPacket(-1, err));
        log("error", `User local login errored`);
      }
    })(req, res);
  });

  app.post("/auth/signup/local", (req, res) => {
    passport.authenticate("local-signup", (err, user, info) => {
      if (user) {
        req.login(user, (err) => {
          if (err) {
            log("error", `Failed serializing ${user.email}`);
          }
          log("info", `Successfully created account for ${user.email}`);
          return res.redirect("/secure-confirmed");
        });
      } else if (info) {
        res.json(sendPacket(0, info.message));
        log("error", `User local signup failed`);
      } else {
        res.json(sendPacket(-1, err));
        log("error", `User local signup errored`);
      }
    })(req, res);
  });

  app.post("/auth/signup/user-exists", async (req, res) => {
    let email = req.body.email;
    let check = await userExists(email);
    if (check) {
      res.json(sendPacket(0, "User with this email already exists"));
      log("error", `User tried creating a duplicate account with ${email}`);
    } else {
      res.json(sendPacket(1, "New User"));
      log("info", `There is not yet an account for ${email}`);
    }
  });

  app.post("/auth/complete-registration/required", async (req, res) => {
    const result = await completeRegistrationRequired(req.body, req.user.email);

    log("info", `Completed required registration for ${req.user.email}`);
    return res.json(result);
  });

  app.post("/auth/complete-registration/details", (req, res) => {
    const userData = req["body"];
    const { email } = userData;

    User.findOne({ email: email }, function (err, user) {
      if (err) {
        log("MONGO ERROR", err);
        return res.json(sendPacket(-1, "Error with mongoDB"));
      }
      if (!user) {
        log("USER ERROR", "User Not Found with email address " + email);
        return res.json(sendPacket(0, "Unable to find this user."));
      }

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
          return res.json(sendPacket(0, "Unable to update user details"));
        }
        log("info", `Successfully updated profile for ${email}`);
        return res.json(sendPacket(1, "Successfully updated user profile"));
      });
    });
  });

  app.get("/auth/curr-user/load", async (req, res) => {
    let email = req.user.email;
    let regComplete = req.user.regComplete;

    let check = await userExists(email);
    if (check) {
      res.json(
        sendPacket(1, "Sending back current user", {
          email: email,
          regComplete: regComplete,
        })
      );
      log("info", `Sent ${email} to frontend`);
    } else {
      res.json(sendPacket(0, "There is no user currently logged in"));
      log("error", `There is no user currently logged in`);
    }
  });

  app.get("/confirmation/:token", async (req, res) => {
    let user = await findUser(req.params.token);

    if (user) {
      req.login(user, (err) => {
        if (err) {
          log("error", `Failed serializing ${user.email}`);
        }
        log("info", `Confirmed user ${user.email}`);
        return res.redirect("/profile/initialize");
      });
    } else {
      res.json(sendPacket(-1, "There was an error processing your request"));
      log("error", `Was not able to confirm user`);
    }
  });

  app.get("/confirmation-resend", isAuthenticated, (req, res) => {
    let email = req.user.email;
    if (email) {
      sendConfirmationEmail(email);
      res.json(sendPacket(1, "Confirmation email has been resent"));
      log("info", `Resent a confirmation email to ${email}`);
    } else {
      res.json(sendPacket(-1, "There was an error processing your request"));
      log("error", `Resend confirmation email for ${email}`);
    }
  });

  app.get("/secure-unconfirmed", isAuthenticated, (req, res) => {
    res.json(
      sendPacket(
        1,
        "Successfully accessed secure endpoint! User needs to confirm account"
      )
    );
    log("info", `User accessed secure-unconfirmed endpoint`);
  });

  app.get("/secure-confirmed", isAuthenticated, isConfirmed, (req, res) => {
    res.json(
      sendPacket(
        1,
        "Successfully accessed secure endpoint! Account has been confirmed"
      )
    );
    log("info", `User accessed secure-confirmed endpoint`);
  });

  app.get("/logout", (req, res) => {
    let email = req.user.email;
    req.logout();
    res.json(sendPacket(1, "Successfully logged out"));
    log("info", `Successfully logged out ${email}`);
  });
};
