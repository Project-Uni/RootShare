import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema(
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
  },
  { timestamps: true }
);

mongoose.model('comments', CommentSchema);
const Comment = mongoose.model('comments');

export default Comment;
