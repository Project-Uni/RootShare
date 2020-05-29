module.exports = function (req, res, next) {
  if (req.user.confirmed) {
    return next();
  }

  return res.redirect('secure-unconfirmed');
};