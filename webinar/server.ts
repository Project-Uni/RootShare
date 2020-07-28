require("dotenv").config();

import * as express from "express";
import * as socketio from "socket.io";

const pino = require("express-pino-logger");
const bodyParser = require("body-parser");
const expressSession = require("express-session");
const http = require("http");

import log from "./helpers/logger";

const port = process.env.PORT || 8003;

const app = express();
app.set("port", port);

app.use(pino());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  expressSession({
    secret: "BayArea_MoreLike_YayArea",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1 * 24 * 60 * 60 * 1000,
    },
  })
);

const server = http.Server(app);
const io = socketio(server);

const webinarCache = {};

require("./routes/cache")(app, webinarCache);
require("./socket/socketSetup")(io, webinarCache);

app.get("/", (req, res) => {
  return res.send("Webinar Cache Micro-Service is Running");
});

function cleanupCache() {
  const keys = Object.keys(webinarCache);
  const timeout = 1000 * 60 * 60 * 3; // 3 HOURS
  for (let i = 0; i < keys.length; i++) {
    const webinarID = keys[i];
    if (Date.now() - webinarCache[webinarID]["startTime"] >= timeout)
      delete webinarCache[webinarID];
  }
}

setInterval(cleanupCache, 1000 * 60 * 10); //10 MINUTES

server.listen(port, () => {
  log("info", `Webinar cache is listening on port ${port}`);
});
