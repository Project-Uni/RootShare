import { userInfo } from "os"

var mongoose = require('mongoose')
var User = mongoose.model('users')
const Cryptr = require('cryptr')

const { CRYPT_SECRET } = require('../../keys/keys.json')
const cryptr = new Cryptr(CRYPT_SECRET)
const nodemailer = require('nodemailer');
const aws = require('aws-sdk');
aws.config.loadFromPath('./../keys/aws_key.json')


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
    let confirmationLink = `http://rootshare.io/confirmation/${emailToken}`

    console.log(`Sending email to: ${emailAddress}`)
    transporter.sendMail({
      from: 'rootshare.io@gmail.com',
      to: `${emailAddress}`,
      subject: 'RootShare Account Confirmation',
      text: `${confirmationLink}`,
    }, (err, info) => {
      if (err) {
        console.log(err)
      }
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