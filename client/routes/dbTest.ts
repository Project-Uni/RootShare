var mongoose = require('mongoose')
const User = mongoose.model('users')

const user1 = {
  firstName: 'Smit',
  lastName: 'Desai',
  email: 'test@gmail.com',
  hashedPassword: 'PLACEHOLDER',
  university: 'Purdue University',
  accountType: 'Alumni',
  graduationYear: 2020,
  department: 'College of Science',
  major: 'Computer Science',
}

module.exports = (app) => {
  app.get('/dbTestFind', (req, res) => {
    User.find((err, users) => {
      res.send(users)
    })
  })

  app.get('/dbTestCreate', (req, res) => {
    User.create(user1, (err) => {
      if (err) return console.error(err);
    })

    res.redirect('/dbTestFind')
  })

  app.get('/dbTestDelete', (req, res) => {
    User.deleteOne({firstName: 'Smit'}, (err) => {
      if (err) return console.error(err);
    })

    res.redirect('/dbTestFind')
  })
};
  