var mongoose = require('mongoose')
var Schema = mongoose.Schema

var userSchema = new Schema({
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    email: {type: String, required: true},
    hashedPassword: {type: String, required: true},
    university: {type: Schema.ObjectId, ref: 'universities', required: true},
    accountType: {type: String, required: true},
    graduationYear: Number,
    department: String,
    major: String,
    phoneNumber: String,
    organizations: Array,
    work: String,
    position: String,
    interests: Array,
    confirmed: {type: Boolean, required: true, default: false},
    verified: {type: Boolean, required: true, default: false}
})

mongoose.model('users', userSchema)