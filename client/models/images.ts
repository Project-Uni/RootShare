const mongoose = require('mongoose');

/**
 *
 * @swagger
 *  components:
 *    schemas:
 *      Image:
 *        type: object
 *        required:
 *          - user
 *          - fileName
 *        properties:
 *          _id:
 *            type: string
 *            description: Auto-generated ID
 *          user:
 *            $ref: '#/components/schemas/User'
 *            description: The user who owns/created the image
 *          post:
 *            $ref: '#/components/schemas/Post'
 *            description: The post the image is associated with
 *          imageType:
 *            type: string
 *            description: The type of image usage
 *          fileName:
 *            type: string
 *            description: The filename in S3 for to locate the image
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
 *          post: 2123456789abcdef
 *          imageType: post
 *          fileName: 2123456789abcdef_image_01.jpeg
 *
 */

const ImageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'users',
      required: true,
      message: 'User is required',
    },
    post: { type: mongoose.Schema.ObjectId, ref: 'posts' },
    imageType: { type: String, default: 'post' }, //Might need this as we expand
    fileName: {
      type: String,
      required: true,
      message: 'fileName is required for image',
    },
  },
  { timestamps: true }
);

mongoose.model('images', ImageSchema);
const Image = mongoose.model('images');

export default Image;
