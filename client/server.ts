import express = require("express");
import pino = require("express-pino-logger");
import bodyParser = require("body-parser");
import expressSession = require("express-session");
import passport = require('passport')
import log from "./helpers/logger";
import * as path from "path";

const mongoConfig = require('./mongoConfig')
const fs = require('fs')

// Use mongoose to connect to MongoDB
mongoConfig.connectDB(function (err, client) {
  if (err) console.log(err);
});

// Load all files in models directory
fs.readdirSync(`${__dirname}/models`).forEach(fileName => {
  if (~fileName.indexOf('ts')) require(`${__dirname}/models/${fileName}`)
});

const app = express();
const port = process.env.PORT || 8000;

app.use(pino());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  expressSession({
    secret: "TBD",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1 * 24 * 60 * 60 * 1000,
    },
  })
);
app.use(passport.initialize())
app.use(passport.session())

require("./routes/user")(app);
require("./routes/dbTest")(app);
require("./routes/loginTest")(app);

require('./passport/setup')(passport)

app.use(express.static(path.join("./", "/frontend/build")));
app.get("*", (_, response) => {
  response.sendFile(path.resolve("./", "/build/frontend/index.html"));
});

app.listen(port, () => {
  log("info", `Listening on port ${port}`);
});