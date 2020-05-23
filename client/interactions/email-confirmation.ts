import { userInfo } from "os"

var mongoose = require('mongoose')
var User = mongoose.model('users')
const Cryptr = require('cryptr')

const { CRYPT_SECRET } = require('../../keys')
const cryptr = new Cryptr(CRYPT_SECRET)
const nodemailer = require('nodemailer');
const aws = require('aws-sdk');
aws.config.loadFromPath('./../aws_key.json')


let transporter = nodemailer.createTransport({
  SES: new aws.SES({
    apiVersion: '2010-12-01'
  })
})

module.exports = {
  findUser: async (emailToken) => {
    let emailAddress = module.exports.convertTokenToEmail(emailToken)
    let currUser
    try {
      currUser = await User.findOne({ 'email': emailAddress })
    } catch (error) {
      console.log(error)
    }

    if (!currUser) {
      return null
    }

    currUser.confirmed = true
    currUser.save()
    return currUser
  },

  sendConfirmationEmail: (emailAddress) => {
    let emailToken = module.exports.convertEmailToToken(emailAddress)
    let confirmationLink = `http://localhost:8000/confirmation/${emailToken}`

    transporter.sendMail({
      from: 'sjdesai3@illinois.edu',
      to: 'smitdesai422@gmail.com',
      subject: 'TEST CONFIRMATION EMAIL',
      text: `${confirmationLink}`,
    }, (err, info) => {
      if (err) {
        console.log(err)
      }
      // console.log(info.envelope)
      // console.log(info.messageId)
    })
  },

  convertEmailToToken: (emailAddress) => {
    let token = cryptr.encrypt(emailAddress)
    return token
  },

  convertTokenToEmail: (emailToken) => {
    let emailAddress
    try {
      emailAddress = cryptr.decrypt(emailToken)
      return emailAddress
    } catch {
      return null
    }
  }
}