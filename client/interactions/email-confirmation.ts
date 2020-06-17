import { userInfo } from "os"

var mongoose = require('mongoose')
var User = mongoose.model('users')
const Cryptr = require('cryptr')

const { CRYPT_SECRET } = require('../../keys/keys.json')
const cryptr = new Cryptr(CRYPT_SECRET)
const nodemailer = require('nodemailer');
const aws = require('aws-sdk');
aws.config.loadFromPath('./../keys/aws_key.json')
import log from '../helpers/logger'


let transporter = nodemailer.createTransport({
  SES: new aws.SES({
    apiVersion: '2010-12-01'
  })
})

let ses = new aws.SES({
  apiVersion: '2010-12-01'
})

module.exports = {
  confirmUser: async (emailToken) => {
    let emailAddress = module.exports.convertTokenToEmail(emailToken)
    let currUser
    try {
      currUser = await User.findOne({ 'email': emailAddress })
    } catch (error) {
      log("MONGO ERROR", error)
    }

    if (!currUser) {
      return null
    }

    currUser.confirmed = true
    await currUser.save()
    return currUser
  },

  unsubscribeUser: async (emailToken) => {
    let emailAddress = module.exports.convertTokenToEmail(emailToken)
    let currUser
    try {
      currUser = await User.findOne({ 'email': emailAddress })
    } catch (error) {
      log("MONGO ERROR", error)
    }

    if (!currUser) {
      return null
    }

    currUser.sendEmails = false
    await currUser.save()
    return currUser
  },

  sendConfirmationEmail: (emailAddress) => {
    const emailToken = module.exports.convertEmailToToken(emailAddress)
    const confirmationLink = `https://rootshare.io/confirmation/${emailToken}`
    const unsubscribeLink = `https://rootshare.io/unsubscribe/${emailToken}`

    var params = {
      Destination: {
        ToAddresses: [`${emailAddress}`]
      },
      Source: `RootShare Team <support@rootshare.io>`,
      Template: 'confirmationTemplate2',
      TemplateData: `{ \"confirmationLink\":\"${confirmationLink}\", \"unsubscribeLink\":\"${unsubscribeLink}\" }`,
      ReplyToAddresses: []
    };

    ses.sendTemplatedEmail(params).promise()
      .then((data) => {
        // log('info', data)
      }).catch((err) => {
        log('error', err)
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