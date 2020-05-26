module.exports = function (req, res, next) {
  // If the user is logged in, continue with the request to the restricted route
  if (req.isAuthenticated()) {
    return next();
  }
  // Send response to the frontend telling them they aren't authenticated
  // and display the login page to them
  return res.json('NOAUTH');
};
