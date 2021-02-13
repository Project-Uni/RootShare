var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 *
 * @swagger
 *  components:
 *    schemas:
 *      Conversation:
 *        type: object
 *        required:
 *          - participants
 *        properties:
 *          _id:
 *            type: string
 *            description: Auto-generated ID
 *          participants:
 *            type: array
 *            items:
 *              $ref: '#/components/schemas/User'
 *            description:
 *          lastMessage:
 *            $ref: '#/components/schemas/Message'
 *            description: The last message that was sent in the conversation
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
 *          participants: [1123456789abcdef, 2123456789abcdef]
 *          lastMessage: 3123456789abcdef
 *
 */

var conversationSchema = new Schema(
  {
    participants: [{ type: Schema.ObjectId, ref: 'users', required: true }],
    lastMessage: { type: Schema.ObjectId, ref: 'messages' },
  },
  { timestamps: true }
);

mongoose.model('conversations', conversationSchema);
const Conversation = mongoose.model('conversations');

export default Conversation;
