const mongoose = require('mongoose');

/**
 *
 * @swagger
 *  components:
 *    schemas:
 *      Comment:
 *        type: object
 *        required:
 *          - user
 *          - message
 *          - post
 *        properties:
 *          _id:
 *            type: string
 *            description: Auto-generated ID
 *          user:
 *            $ref: '#/components/schemas/User'
 *            description: The user who posted the comment
 *          message:
 *            type: string
 *            description: The content of the comment
 *          likes:
 *            type: array
 *            items:
 *              $ref: '#/components/schemas/User'
 *            description: The users who have liked the comment
 *          post:
 *            $ref: '#/components/schemas/Post'
 *            description: The post the comment was left on
 *          createdAt:
 *            type: string
 *            format: date-time
 *            description: The date of the record creation.
 *          updatedAt:
 *            type: string
 *            format: date-time
 *            description: When the record was last updated
 *        example:
 *          _id: 0123456789abcdef
 *          user: 1123456789abcdef
 *          message: Hello World
 *          likes: [2123456789abcdef, 3123456789abcdef]
 *          post: 4123456789abcdef
 *
 */

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
