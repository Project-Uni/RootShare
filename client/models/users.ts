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
    sendEmails: { type: Boolean, required: true, default: true },
    confirmed: { type: Boolean, required: true, default: false },
    verified: { type: Boolean, required: true, default: false },
    RSVPWebinars: {
      type: [{ type: Schema.ObjectId, ref: 'webinars' }],
      required: true,
      default: [],
    },
    connections: {
      type: [{ type: mongoose.Schema.ObjectId, ref: 'users' }],
      required: true,
      default: [],
    },
    posts: {
      type: [{ type: mongoose.Schema.ObjectId, ref: 'posts' }],
      required: true,
      default: [],
    },
    joinedCommunities: {
      type: [{ type: mongoose.Schema.ObjectId, ref: 'communities' }],
      required: true,
      default: [],
    },
    pendingCommunities: {
      type: [{ type: mongoose.Schema.ObjectId, ref: 'communities' }],
      required: true,
      default: [],
    },
  },
  { timestamps: true }
);

mongoose.model('users', userSchema);
