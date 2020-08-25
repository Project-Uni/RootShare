import mongoose = require('mongoose');
const { Schema, Types } = mongoose;

var userSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    university: { type: Types.ObjectId, ref: 'universities' },
    accountType: { type: String },
    privilegeLevel: { type: Number, default: 1 },
    hashedPassword: String,
    googleID: String,
    linkedinID: String,
    graduationYear: Number,
    department: String,
    major: String,
    phoneNumber: String,
    organizations: Array,
    work: String,
    position: String,
    interests: Array,
    graduateSchool: String,
    discoveryMethod: String,
    sendEmails: { type: Boolean, required: true, default: true },
    confirmed: { type: Boolean, required: true, default: false },
    verified: { type: Boolean, required: true, default: false },
    RSVPWebinars: {
      type: [{ type: Types.ObjectId, ref: 'webinars' }],
    },
    attendedWebinars: {
      type: [{ type: Types.ObjectId, ref: 'webinars' }],
    },
    connections: {
      type: [{ type: Types.ObjectId, ref: 'connections' }],
    },
    pendingConnections: {
      type: [{ type: Types.ObjectId, ref: 'connections' }],
    },
    joinedCommunities: {
      type: [{ type: Types.ObjectId, ref: 'communities' }],
    },
    pendingCommunities: {
      type: [{ type: Types.ObjectId, ref: 'communities' }],
    },
    //TODO - Add fields for background image
    profilePicture: { type: String },
  },
  { timestamps: true }
);

mongoose.model('users', userSchema);
const User = mongoose.model('users');

export default User;
