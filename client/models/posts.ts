import mongoose = require('mongoose');
const { Schema, Types } = mongoose;

const PostSchema = new Schema(
  {
    user: {
      type: Types.ObjectId,
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
      type: [{ type: Types.ObjectId, ref: 'users' }],
      default: [],
    },
    community: { type: Types.ObjectId, ref: 'communities' },
  },
  { timestamps: true }
);

mongoose.model('posts', PostSchema);
const Post = mongoose.model('posts');

export default Post;
