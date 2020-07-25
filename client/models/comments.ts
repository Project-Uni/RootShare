const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema(
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
    likes: { type: [{ type: mongoose.Schema.ObjectId, ref: 'users' }] },
    post: {
      type: mongoose.Schema.ObjectId,
      ref: 'posts',
      required: true,
      message: 'Post is required to create a comment',
    },
  },
  { timestamps: true }
);

mongoose.model('comments', CommentSchema);
const Comment = mongoose.model('comments');

export default Comment;
