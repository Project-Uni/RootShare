module.exports = (app) => {
  app.get("/test", (req, res) => {
    return res.send("Hello!");
  });
};
