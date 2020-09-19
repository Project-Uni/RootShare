var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    university: { type: Schema.ObjectId, ref: 'universities' },
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
    bio: String,
    sendEmails: { type: Boolean, required: true, default: true },
    confirmed: { type: Boolean, required: true, default: false },
    verified: { type: Boolean, required: true, default: false },
    externalComplete: { type: Boolean, required: true, default: false },
    RSVPWebinars: {
      type: [{ type: Schema.ObjectId, ref: 'webinars' }],
    },
    attendedWebinars: {
      type: [{ type: Schema.ObjectId, ref: 'webinars' }],
    },
    connections: {
      type: [{ type: Schema.ObjectId, ref: 'connections' }],
    },
    pendingConnections: {
      type: [{ type: Schema.ObjectId, ref: 'connections' }],
    },
    joinedCommunities: {
      type: [{ type: Schema.ObjectId, ref: 'communities' }],
    },
    pendingCommunities: {
      type: [{ type: Schema.ObjectId, ref: 'communities' }],
    },
    //TODO - Add fields for background image
    profilePicture: { type: String },
    broadcastedPosts: {
      type: [{ type: Schema.ObjectId, ref: 'posts' }],
    },
    communityPosts: {
      type: [{ type: Schema.ObjectId, ref: 'posts' }],
    },
  },
  { timestamps: true }
);

mongoose.model('users', userSchema);
const User = mongoose.model('users');

export default User;
