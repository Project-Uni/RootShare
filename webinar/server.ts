const express = require("express");
const pino = require("express-pino-logger");
const bodyParser = require("body-parser");
const io = require("socket.io");
const expressSession = require("express-session");

import log from "./helpers/logger";

const port = process.env.PORT || 8003;

const app = express();

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

const webinarCache = {};

app.get("/", (req, res) => {
  return res.send("Reached root of webinar cache micro-service");
});

app.listen(port, () => {
  log("info", `Webinar cache is listening on port ${port}`);
});
