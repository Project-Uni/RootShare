var mongoose = require('mongoose')
const User = mongoose.model('users')
const University = mongoose.model('universities')

const user1 = {
  firstName: 'Smit',
  lastName: 'Desai',
  email: 'test@gmail.com',
  hashedPassword: 'PLACEHOLDER',
  accountType: 'Alumni',
  graduationYear: 2020,
  department: 'College of Science',
  major: 'Computer Science',
}

const purdue_entry = require('../helpers/universityCatalog.json')

module.exports = (app) => {
  app.get('/dbTestFind/User', (req, res) => {
    User.find((err, users) => {
      res.send(users)
    })
  })

  app.get('/dbTestCreate/User', (req, res) => {
    University.find({universityName: 'Purdue University'}, (err, universities) => {
      var tempUser = user1
      tempUser["university"] = universities[0]["id"]
      console.log(tempUser)
      User.create(tempUser, (err) => {
        if (err) return console.error(err);
      })
    })

    res.redirect('/dbTestFind/User')
  })

  app.get('/dbTestDelete/User', (req, res) => {
    User.deleteOne({firstName: 'Smit'}, (err) => {
      if (err) return console.error(err);
    })

    res.redirect('/dbTestFind/User')
  })

  app.get('/dbTestFind/University', (req, res) => {
    University.find((err, universities) => {
      res.send(universities)
    })
  })

  app.get('/dbTestCreate/University', (req, res) => {
    University.create(purdue_entry, (err) => {
      if (err) return console.error(err);
    })

    res.redirect('/dbTestFind/University')
  })

  app.get('/dbTestDelete/University', (req, res) => {
    University.deleteOne({universityName: 'Purdue University'}, (err) => {
      if (err) return console.error(err);
    })

    res.redirect('/dbTestFind/University')
  })
};
  