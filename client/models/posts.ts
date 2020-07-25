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
    community: { type: mongoose.Schema.ObjectId, ref: 'communities' },
  },
  { timestamps: true }
);

mongoose.model('posts', PostSchema);
const Post = mongoose.model('posts');

export default Post;
