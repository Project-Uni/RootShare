var passport = require('passport')

var isAuthenticated = require('../passport/middleware/isAuthenticated')

module.exports = (app) => {
  // redirects should be handled by React
  app.post('/login', passport.authenticate('login'), (req, res) => {
    res.json('success')
  });

  app.post('/signup', passport.authenticate('signup'), (req, res) => {
    res.json('success')
  });

  app.get('/secure', isAuthenticated, (req, res) => {
    res.json('success')
  })

  app.get('/logout', (req, res) => {
    req.logout()
    res.json('success')
  })
}