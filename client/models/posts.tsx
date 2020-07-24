import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.objectId,
      ref: 'users',
      required: true,
      message: 'User is required',
    },
    message: {
      type: String,
      required: true,
      message: 'Message is required',
    },
    likes: [
      {
        type: mongoose.Schema.objectId,
        ref: 'users',
        required: true,
        message: 'Likes are required',
        default: [],
      },
    ],
    community: { type: mongoose.Schema.objectId, ref: 'communities' },
    comments: [{ type: mongoose.Schema.objectId, ref: 'comments' }],
  },
  { timestamps: true }
);

mongoose.model('posts', PostSchema);
const Post = mongoose.model('posts');

export default Post;
