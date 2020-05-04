const express = require("express");
const pino = require("express-pino-logger")();

const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const expressSession = require("express-session");

const app = express();
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
app.use(pino);
require("./routes/user")(app);

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
