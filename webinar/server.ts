require("dotenv").config();

import * as express from "express";
import * as socketio from "socket.io";

const pino = require("express-pino-logger");
const bodyParser = require("body-parser");
const expressSession = require("express-session");
const http = require("http");

import log from "./helpers/logger";
import sendPacket from "./helpers/sendPacket";
import { isAuthenticatedWithJWT } from "./middleware/isAuthenticated";

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

app.get("/", (req, res) => {
  return res.send("Reached root of webinar cache micro-service");
});

app.post("/api/createWebinar", isAuthenticatedWithJWT, (req, res) => {
  const { webinarID } = req.body;
  if (!webinarID) return res.json(sendPacket(-1, "webinarID not in request"));

  if (webinarID in webinarCache)
    return res.json(sendPacket(0, "Webinar already initialized in cache"));

  const startTime = Date.now();
  webinarCache[webinarID] = { users: {}, startTime };

  return res.json(sendPacket(1, "Successfully initialized webinar in cache"));
});

app.post("/api/removeWebinar", isAuthenticatedWithJWT, (req, res) => {
  const { webinarID } = req.body;

  if (!webinarID) return res.json(sendPacket(-1, "webinarID not in request"));
  if (!(webinarID in webinarCache))
    return res.json(sendPacket(0, "Webinar not found in cache"));

  delete webinarCache[webinarID];
});

app.post("/api/getActiveUsers", isAuthenticatedWithJWT, (req, res) => {
  const { webinarID } = req.body;
  if (!webinarID) return res.json(sendPacket(-1, "webinarID not in request"));
  if (!(webinarID in webinarCache))
    return res.json(sendPacket(0, "Webinar not found in cache"));

  const activeUserIDs = Object.keys(webinarCache[webinarID].users);

  return res.json(
    sendPacket(1, "Successfully fetched active users", { activeUserIDs })
  );
});

io.on("connection", (socket: socketio.Socket) => {
  let socketUserId = "";
  let socketWebinarId = "";
  log("connection", `${socket.client.id}`);

  socket.on("new-user", (data: { webinarID: string; userID: string }) => {
    const { userID, webinarID } = data;
    if (!userID || !webinarID) {
      return log("alert", "Invalid socket connection received");
    }
    socketUserId = userID;
    socketWebinarId = webinarID;

    if (!(webinarID in webinarCache)) {
      socket.emit("webinar-error", "Webinar not in cache");
      log("error", "Invalid webinarID received");
    }
    socket.join(`${webinarID}`);

    webinarCache[webinarID].users[userID] = socket;
  });

  socket.on("disconnect", () => {
    log("disconnect", `${socketUserId}`);
    delete webinarCache[socketWebinarId].users[socketUserId];
  });
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
