import mongoose = require('mongoose');
const { Schema, Types } = mongoose;

const CommentSchema = new Schema(
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
    likes: { type: [{ type: Types.ObjectId, ref: 'users' }] },
    post: {
      type: Types.ObjectId,
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
