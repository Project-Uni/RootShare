const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'users',
      required: true,
      message: 'User is required',
    },
    message: {
      type: String,
      required: true,
      message: 'Message is required',
    },
    likes: {
      type: [{ type: mongoose.Schema.ObjectId, ref: 'users' }],
      default: [],
    },
    comments: {
      type: [{ type: mongoose.Schema.ObjectId, ref: 'comments' }],
      default: [],
    },
    images: {
      type: [{ type: mongoose.Schema.ObjectId, ref: 'images' }],
    },
    toCommunity: { type: mongoose.Schema.ObjectId, ref: 'communities' },
    fromCommunity: { type: mongoose.Schema.ObjectId, ref: 'communities' },
    anonymous: { type: Boolean, default: false },
    type: { type: String, default: 'broadcast', required: true },
    // NOTE: Type Values: 'internalCurrent', 'internalAlumni', 'external', 'broadcast'
    // MongoDB does not allow custom typing so we will have to type check as we use
    university: {
      type: mongoose.Schema.ObjectId,
      ref: 'universities',
      required: true,
      default: '5eb89c308cc6636630c1311f',
    },
  },
  { timestamps: true }
);

mongoose.model('posts', PostSchema);
const Post = mongoose.model('posts');

export default Post;
