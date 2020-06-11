var mongoose = require('mongoose')
var Schema = mongoose.Schema

var webinarSchema = new Schema({
  host: { type: Schema.ObjectId, ref: "users" },
  speakers: [{ type: Schema.ObjectId, ref: "users" }],
  attendees: [{ type: Schema.ObjectId, ref: "users" }],
  opentokSessionID: String
})

mongoose.model('webinars', webinarSchema)