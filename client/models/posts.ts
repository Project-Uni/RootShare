const mongoose = require('mongoose');

/**
 *
 * @swagger
 *  components:
 *    schemas:
 *      Post:
 *        type: object
 *        required:
 *          - user
 *          - message
 *          - type
 *          - university
 *        properties:
 *          _id:
 *            type: string
 *            description: Auto-generated ID
 *          user:
 *            $ref: '#/components/schemas/User'
 *            description: The user who created the post
 *          message:
 *            type: string
 *            description: The text contained in the post
 *          likes:
 *            type: array
 *            items:
 *              $ref: '#/components/schemas/User'
 *            description: The people who liked this post
 *          comments:
 *            type: array
 *            items:
 *              $ref: '#/components/schemas/Comment'
 *            description: The comments left on this post
 *          images:
 *            type: array
 *            items:
 *              type: string
 *            description: Images contained in the post
 *          toCommunity:
 *            $ref: '#/components/schemas/Community'
 *            description: The community this was posted to
 *          fromCommunity:
 *            $ref: '#/components/schemas/Community'
 *            description: The community this was posted by
 *          anonymous:
 *            type: boolean
 *            description: Whether the post is made anonymously or not
 *          type:
 *            type: string
 *            description: The type of post it is
 *          university:
 *            $ref: '#/components/schemas/University'
 *            description: The university this was posted in
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
 *          message: Hello World!
 *          likes: [2123456789abcdef, 3123456789abcdef]
 *          comments: [4123456789abcdef, 5123456789abcdef]
 *          images: [6123456789abcdef, 7123456789abcdef]
 *          toCommunity: 8123456789abcdef
 *          fromCommunity: 9123456789abcdef
 *          anonymous: true
 *          type: broadcast
 *          university: a123456789abcdef
 *
 */

const postSchema = new mongoose.Schema(
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

mongoose.model('posts', postSchema);
const Post = mongoose.model('posts');

export default Post;
