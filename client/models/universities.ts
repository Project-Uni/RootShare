var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 *
 * @swagger
 *  components:
 *    schemas:
 *      University:
 *        type: object
 *        required:
 *          - universityName
 *          - departments
 *          - required
 *          - message
 *        properties:
 *          _id:
 *            type: string
 *            description: Auto-generated ID
 *          universityName:
 *            type: string
 *            description: Official name of the university
 *          nickname:
 *            type: string
 *            description: Common nickname or short name of the university
 *          departments:
 *            type: array
 *            items:
 *              type: string
 *            description: The official departments/colleges in the university
 *          communities:
 *            type: array
 *            items:
 *              $ref: '#/components/schemas/Community'
 *            description: The communities on RootShare associated with the university
 *
 *        example:
 *          _id: 0123456789abcdef
 *          universityName: Purdue University
 *          nickname: Purdue
 *          departments: [College of Science, College of Engineering]
 *          communities: [1123456789abcdef, 2123456789abcdef, 3123456789abcdef]
 *
 */

var universitySchema = new Schema({
  universityName: { type: String, required: true },
  nickname: { type: String },
  departments: { type: Array, required: true, default: [] },
  communities: {
    type: [{ type: Schema.ObjectId, ref: 'communities' }],
    required: true,
    default: [],
    message: 'Communities are required, use default []',
  },
  imageRef: String,
});

mongoose.model('universities', universitySchema);
const University = mongoose.model('universities');

export default University;
