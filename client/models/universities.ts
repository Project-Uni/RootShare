var mongoose = require('mongoose')
var Schema = mongoose.Schema

var universitySchema = new Schema({
    universityName: {type: String, required: true},
    departments: {type: Array, required: true},
    organizations: {type: Array, required: true},
    imageRef: String
})

mongoose.model('universities', universitySchema)