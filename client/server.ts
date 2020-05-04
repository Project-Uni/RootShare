import express = require("express");
import pino = require("express-pino-logger");

import bodyParser = require("body-parser");
import expressSession = require("express-session");
import log from "./helpers/logger";
import * as path from "path";

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

require("./routes/user")(app);

app.use(express.static(path.join("./", "/frontend/build")));
app.get("*", (_, response) => {
  response.sendFile(path.resolve("./", "/build/frontend/index.html"));
});

app.listen(port, () => {
  log("info", `Listening on port ${port}`);
});
