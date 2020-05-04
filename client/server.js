const express = require("express");
const pino = require("express-pino-logger")();

const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const expressSession = require("express-session");

const app = express();
const path = require("path");
const port = process.env.PORT || 8000;

app.use(pino);
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

app.use(express.static(path.join(__dirname, "/frontend/build")));
app.get("*", (_, response) => {
  response.sendFile(path.join(__dirname, "/build/frontend/index.html"));
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
